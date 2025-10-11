import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs-core";
import * as posedetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-wasm";
import { setWasmPaths } from "@tensorflow/tfjs-backend-wasm";

/**
 * Props:
 *  - exercise: 'pushup' | 'squat' | 'superman'
 *  - onRep: () => void
 */
export default function PoseCoach({ exercise, onRep }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(0);
  const streamRef = useRef(null);

  const [status, setStatus] = useState("Chưa khởi động");
  const [goodForm, setGoodForm] = useState(false);
  const [started, setStarted] = useState(false);
  const [lastErr, setLastErr] = useState("");

  // camera picker
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");

  // ===== utils
  const angle = (a, b, c) => {
    const ab = { x: a.x - b.x, y: a.y - b.y };
    const cb = { x: c.x - b.x, y: c.y - b.y };
    const dot = ab.x * cb.x + ab.y * cb.y;
    const mab = Math.hypot(ab.x, ab.y);
    const mcb = Math.hypot(cb.x, cb.y);
    const cos = Math.max(-1, Math.min(1, dot / (mab * mcb || 1)));
    return (Math.acos(cos) * 180) / Math.PI;
  };
  const getKP = (kps, name) => kps.find((k) => k.name === name);
  const draw = (ctx, kps, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 2;
    kps.forEach((k) => {
      if (k.score && k.score < 0.3) return;
      ctx.beginPath();
      ctx.arc(k.x, k.y, 4, 0, Math.PI * 2);
      ctx.strokeStyle = "#00B3A4";
      ctx.stroke();
    });
  };

  // ===== heuristics
  const evalPushup = (kps) => {
    const lS = getKP(kps, "left_shoulder");
    const rS = getKP(kps, "right_shoulder");
    const lH = getKP(kps, "left_hip");
    const rH = getKP(kps, "right_hip");
    const lK = getKP(kps, "left_knee");
    const rK = getKP(kps, "right_knee");
    const lE = getKP(kps, "left_elbow");
    const rE = getKP(kps, "right_elbow");
    const lW = getKP(kps, "left_wrist");
    const rW = getKP(kps, "right_wrist");
    if (![lS, rS, lH, rH, lK, rK, lE, rE, lW, rW].every(Boolean))
      return { ok: false };
    const hipKneeS_L = angle(lS, lH, lK);
    const hipKneeS_R = angle(rS, rH, rK);
    const spineStraight = (hipKneeS_L + hipKneeS_R) / 2 >= 160;
    const elbowL = angle(lS, lE, lW);
    const elbowR = angle(rS, rE, rW);
    const elbowAvg = (elbowL + elbowR) / 2;
    return {
      ok: spineStraight,
      phaseDown: elbowAvg < 100,
      phaseUp: elbowAvg > 155,
    };
  };
  const evalSquat = (kps) => {
    const lH = getKP(kps, "left_hip");
    const rH = getKP(kps, "right_hip");
    const lK = getKP(kps, "left_knee");
    const rK = getKP(kps, "right_knee");
    const lA = getKP(kps, "left_ankle");
    const rA = getKP(kps, "right_ankle");
    const lS = getKP(kps, "left_shoulder");
    const rS = getKP(kps, "right_shoulder");
    if (![lH, rH, lK, rK, lA, rA].every(Boolean)) return { ok: false };
    const backL = lS && angle(lS, lH, lK);
    const backR = rS && angle(rS, rH, rK);
    const backOk = ((backL || 160) + (backR || 160)) / 2 >= 150;
    const kneeL = angle(lH, lK, lA);
    const kneeR = angle(rH, rK, rA);
    const kneeAvg = (kneeL + kneeR) / 2;
    return { ok: backOk, phaseDown: kneeAvg < 100, phaseUp: kneeAvg > 160 };
  };
  const evalSuperman = (kps) => {
    const lS = getKP(kps, "left_shoulder");
    const rS = getKP(kps, "right_shoulder");
    const lH = getKP(kps, "left_hip");
    const rH = getKP(kps, "right_hip");
    const lA = getKP(kps, "left_ankle");
    const rA = getKP(kps, "right_ankle");
    if (![lS, rS, lH, rH, lA, rA].every(Boolean)) return { ok: false };
    const shoulderY = (lS.y + rS.y) / 2;
    const hipY = (lH.y + rH.y) / 2;
    const ankleY = (lA.y + rA.y) / 2;
    const lifted = shoulderY + 10 < hipY && hipY + 10 < ankleY;
    return { ok: lifted, phaseDown: lifted, phaseUp: !lifted };
  };
  const evalByExercise = (kps) => {
    switch (exercise) {
      case "pushup":
        return evalPushup(kps);
      case "squat":
        return evalSquat(kps);
      case "superman":
        return evalSuperman(kps);
      default:
        return { ok: false };
    }
  };

  // rep FSM
  const phaseRef = useRef("idle");
  const lastRepAtRef = useRef(0);
  const updateRepFSM = (res) => {
    if (!res) return;
    const now = performance.now();
    const { phaseDown, phaseUp } = res;
    if (phaseDown && phaseRef.current !== "down") phaseRef.current = "down";
    if (phaseUp && phaseRef.current === "down") {
      if (now - lastRepAtRef.current > 500) {
        lastRepAtRef.current = now;
        onRep && onRep();
      }
      phaseRef.current = "up";
    }
    if (!phaseDown && !phaseUp) phaseRef.current = "idle";
  };

  // enumerate devices (khi có quyền mới thấy label)
  const refreshDevices = async () => {
    const all = await navigator.mediaDevices.enumerateDevices();
    const cams = all.filter((d) => d.kind === "videoinput");
    setDevices(cams);
    if (!deviceId && cams[0]?.deviceId) setDeviceId(cams[0].deviceId);
  };

  const openStreamWithFallbacks = async () => {
    // 1) thử deviceId exact (nếu có)
    const trials = [];
    if (deviceId) {
      trials.push({
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
    }
    // 2) facingMode user
    trials.push({
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    });
    // 3) mặc định
    trials.push({ video: true, audio: false });

    let err;
    for (const c of trials) {
      try {
        const s = await navigator.mediaDevices.getUserMedia(c);
        return s;
      } catch (e) {
        err = e;
      }
    }
    throw err;
  };

  const start = async () => {
    setLastErr("");
    try {
      setStatus("Khởi tạo TFJS…");
      try {
        await tf.setBackend("webgl");
      } catch {}
      if (tf.getBackend() !== "webgl") {
        setWasmPaths(
          "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@4.20.0/dist/"
        );
        await tf.setBackend("wasm");
      }
      await tf.ready();
      setStatus(`Backend: ${tf.getBackend()}`);

      setStatus("Tải model MoveNet…");
      const detector = await posedetection.createDetector(
        posedetection.SupportedModels.MoveNet,
        { modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      );
      detectorRef.current = detector;

      setStatus("Mở camera…");
      // gọi một lần getUserMedia để OS hỏi quyền, sau đó enumerateDevices sẽ có label
      const stream = await openStreamWithFallbacks();
      streamRef.current = stream;
      await refreshDevices();

      const video = videoRef.current;
      video.srcObject = stream;
      await video.play().catch(() => {});
      setStarted(true);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const render = async () => {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (w && h) {
          canvas.width = w;
          canvas.height = h;
          const poses = await detector.estimatePoses(video, {
            maxPoses: 1,
            flipHorizontal: true,
          });
          if (poses?.[0]?.keypoints) {
            const kps = poses[0].keypoints.map((kp, i) => ({
              ...kp,
              name: posedetection.util.getKeypointName(
                posedetection.SupportedModels.MoveNet,
                i
              ),
            }));
            draw(ctx, kps, w, h);
            const res = evalByExercise(kps);
            setGoodForm(!!res.ok);
            updateRepFSM(res);
          } else {
            ctx.clearRect(0, 0, w, h);
            setGoodForm(false);
          }
        }
        rafRef.current = requestAnimationFrame(render);
      };

      setStatus("Sẵn sàng ✅");
      render();
    } catch (e) {
      console.error(e);
      setLastErr(`${e.name || ""} ${e.message || e}`.trim());
      setStatus("Không mở được camera hoặc model.");
      setStarted(false);
    }
  };

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    detectorRef.current?.dispose?.();
    setStarted(false);
  };

  useEffect(() => {
    // load danh sách thiết bị ngay từ đầu (có thể chưa có label)
    if (navigator.mediaDevices?.enumerateDevices) {
      refreshDevices().catch(() => {});
    }
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-2xl border border-[#1c2227] bg-[#0f1214] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="text-sm font-semibold">FormCheck Camera</div>
        <div
          className={`text-xs ${
            goodForm ? "text-emerald-400" : "text-amber-400"
          }`}
        >
          {goodForm ? "Đúng tư thế" : "Cần chỉnh tư thế"}
        </div>
      </div>

      {/* Camera picker */}
      <div className="px-3 pb-2 flex items-center gap-2">
        <label className="text-xs text-gray-400">Camera:</label>
        <select
          className="bg-[#0b0e10] border border-white/10 rounded-lg px-2 py-1 text-xs"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
        >
          {devices.map((d, i) => (
            <option key={d.deviceId || i} value={d.deviceId}>
              {d.label || `Camera ${i + 1}`}
            </option>
          ))}
        </select>
        {!started ? (
          <button
            onClick={start}
            className="px-2 py-1 rounded-lg border border-white/10 hover:bg-white/10 text-xs"
          >
            Bắt đầu
          </button>
        ) : (
          <button
            onClick={stop}
            className="px-2 py-1 rounded-lg border border-white/10 hover:bg-white/10 text-xs"
          >
            Dừng
          </button>
        )}
      </div>

      <div className="relative">
        <video ref={videoRef} className="w-full opacity-60" playsInline muted />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>

      <div className="px-3 py-2 text-xs text-gray-400">
        {status}
        {lastErr ? ` • ${lastErr}` : ""}
      </div>
      {!started && <div className="px-3 pb-3 text-[11px] text-gray-500"></div>}
    </div>
  );
}
