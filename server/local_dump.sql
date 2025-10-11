--
-- PostgreSQL database dump
--

\restrict duQZv1465Ptm569BTQqjAmo0oZBaZ3gSxpFezxRh6i3h4bca6wrvIjxGgoJozUx

-- Dumped from database version 16.10 (Homebrew)
-- Dumped by pg_dump version 16.10 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: Billing; Type: TYPE; Schema: public; Owner: fitx
--

CREATE TYPE public."Billing" AS ENUM (
    'MONTHLY',
    'YEARLY'
);


ALTER TYPE public."Billing" OWNER TO fitx;

--
-- Name: Category; Type: TYPE; Schema: public; Owner: fitx
--

CREATE TYPE public."Category" AS ENUM (
    'FATLOSS',
    'STRENGTH',
    'YOGA'
);


ALTER TYPE public."Category" OWNER TO fitx;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: fitx
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'CANCELED',
    'EXPIRED'
);


ALTER TYPE public."PaymentStatus" OWNER TO fitx;

--
-- Name: Plan; Type: TYPE; Schema: public; Owner: fitx
--

CREATE TYPE public."Plan" AS ENUM (
    'FREE',
    'BASIC',
    'PRO',
    'ELITE'
);


ALTER TYPE public."Plan" OWNER TO fitx;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: fitx
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO fitx;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: fitx
--

CREATE TABLE public."Invoice" (
    id text NOT NULL,
    "userId" text NOT NULL,
    plan public."Plan" NOT NULL,
    billing public."Billing" NOT NULL,
    amount integer NOT NULL,
    currency text DEFAULT 'VND'::text NOT NULL,
    method text DEFAULT 'VIETQR'::text NOT NULL,
    "bankCode" text NOT NULL,
    "accountNo" text NOT NULL,
    "accountName" text NOT NULL,
    "addInfo" text NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "paidAt" timestamp(3) without time zone
);


ALTER TABLE public."Invoice" OWNER TO fitx;

--
-- Name: Lesson; Type: TABLE; Schema: public; Owner: fitx
--

CREATE TABLE public."Lesson" (
    id text NOT NULL,
    title text NOT NULL,
    level text,
    "videoUrl" text,
    "premiumOnly" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text
);


ALTER TABLE public."Lesson" OWNER TO fitx;

--
-- Name: Program; Type: TABLE; Schema: public; Owner: fitx
--

CREATE TABLE public."Program" (
    id text NOT NULL,
    title text NOT NULL,
    "planMin" public."Plan" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ownerId" text,
    category public."Category" NOT NULL
);


ALTER TABLE public."Program" OWNER TO fitx;

--
-- Name: User; Type: TABLE; Schema: public; Owner: fitx
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text,
    name text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "subscriptionPlan" public."Plan" DEFAULT 'FREE'::public."Plan" NOT NULL,
    "subscriptionBilling" public."Billing",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "avatarUrl" text,
    "googleId" text,
    provider text
);


ALTER TABLE public."User" OWNER TO fitx;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: fitx
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO fitx;

--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: fitx
--

COPY public."Invoice" (id, "userId", plan, billing, amount, currency, method, "bankCode", "accountNo", "accountName", "addInfo", status, "createdAt", "paidAt") FROM stdin;
\.


--
-- Data for Name: Lesson; Type: TABLE DATA; Schema: public; Owner: fitx
--

COPY public."Lesson" (id, title, level, "videoUrl", "premiumOnly", "createdAt", "userId") FROM stdin;
cmfyxc0p90002ohnys7s2bokg	Full Body Warm-up (10m)	Beginner	\N	f	2025-09-25 04:39:43.245	\N
cmfyxc0p90003ohny59yz26cn	HIIT 20m – Burn Fat Fast	Intermediate	\N	t	2025-09-25 04:39:43.245	\N
cmfyxc0p90004ohny99e7y3mv	Core & Abs 15m	All	\N	f	2025-09-25 04:39:43.245	\N
cmfyxc0p90005ohnyzxx2l1e6	Mobility Flow 12m	All	\N	f	2025-09-25 04:39:43.245	\N
cmfyxfl9r0002bw22sgisgept	Full Body Warm-up (10m)	Beginner	\N	f	2025-09-25 04:42:29.871	\N
cmfyxfl9r0003bw22mhnmgy46	HIIT 20m – Burn Fat Fast	Intermediate	\N	t	2025-09-25 04:42:29.871	\N
cmfyxfl9r0004bw22kwkmsqcn	Core & Abs 15m	All	\N	f	2025-09-25 04:42:29.871	\N
cmfyxfl9r0005bw2274wqmzqn	Mobility Flow 12m	All	\N	f	2025-09-25 04:42:29.871	\N
cmfyxje1r000210c5uhyrgab1	Full Body Warm-up (10m)	Beginner	\N	f	2025-09-25 04:45:27.135	\N
cmfyxje1r000310c5mg5gbfhs	HIIT 20m – Burn Fat Fast	Intermediate	\N	t	2025-09-25 04:45:27.135	\N
cmfyxje1r000410c5f31xwxws	Core & Abs 15m	All	\N	f	2025-09-25 04:45:27.135	\N
cmfyxje1r000510c5bjqhjsbf	Mobility Flow 12m	All	\N	f	2025-09-25 04:45:27.135	\N
\.


--
-- Data for Name: Program; Type: TABLE DATA; Schema: public; Owner: fitx
--

COPY public."Program" (id, title, "planMin", "createdAt", "ownerId", category) FROM stdin;
cmfyxje1t000610c5d11t3j2g	Fat Loss – 4 Weeks	FREE	2025-09-25 04:45:27.137	\N	FATLOSS
cmfyxje1t000710c58dzgggsk	Strength Builder	BASIC	2025-09-25 04:45:27.137	\N	STRENGTH
cmfyxje1t000810c5rn4nnsp4	Yoga Relax 21-Day	PRO	2025-09-25 04:45:27.137	\N	YOGA
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: fitx
--

COPY public."User" (id, email, "passwordHash", name, role, "subscriptionPlan", "subscriptionBilling", "createdAt", "updatedAt", active, "avatarUrl", "googleId", provider) FROM stdin;
cmfyxc0p70001ohnyu4tiajwn	user@fitx.dev	$2a$10$D2SrGiXg6vOtLpK.O5kbUeTsoMvk7D1OnLAk6e6CES0xBmtuw1JjK	Demo User	USER	PRO	\N	2025-09-25 04:39:43.244	2025-09-26 06:41:50.556	t	\N	\N	\N
cmg0xshba000085yr7gibkhpz	lequan@gmail.com	$2a$10$MrbLkX2stWQeGpfmMGdE0eyaQubucoqpwwASwY0aCqc2WyLeUR2bO	lê đạt	USER	FREE	\N	2025-09-26 14:28:03.623	2025-09-26 14:28:03.623	t	\N	\N	\N
cmg0xyau4000185yrj5yubq2f	ledat123@gmail.com	$2a$10$kDEDKtSBBj3Kxu.kNGxG4uLQsfVNqifdEzBw2pYFTme3x/9/B9Dlu	sada	USER	FREE	\N	2025-09-26 14:32:35.165	2025-09-26 14:32:35.165	t	\N	\N	\N
cmg0y1nsl000285yr8wlcjoi3	lequangdat220000@gmail.com	$2a$10$8bLFOFukokBsmGFXoAdEpepLK6SF7XHqqYUywP0UGtUaVLxDQ0t46	ledat123	USER	FREE	\N	2025-09-26 14:35:11.925	2025-09-26 14:35:11.925	t	\N	\N	\N
cmg15i4la0000i683tu4yjpih	lequangdat1901@gmail.com	\N	ĐẠT	USER	FREE	\N	2025-09-26 18:03:57.503	2025-09-26 18:03:57.503	t	https://lh3.googleusercontent.com/a/ACg8ocLV7f5dUtg3DVyzVapBEs1Qic3heN-t5vtOXMetKHHZbETEvQ=s96-c	102948479904312535622	GOOGLE
cmg15jmjb0001i683iwj04a54	lequangdat20000000@gmail.com	$2a$10$dUm8E2HdviD9Z4JAOkIncO2RqLOgCil7.cZnmqR6Rk/zQtZPSn4QO	dsdakdk	USER	FREE	\N	2025-09-26 18:05:07.415	2025-09-26 18:05:07.415	t	\N	\N	\N
cmg39kckr0000idj1lzqxq17p	lequangdat20000@gmail.com	\N	Lạnh Lùng Boy	USER	FREE	\N	2025-09-28 05:33:11.979	2025-09-28 05:33:11.979	t	https://lh3.googleusercontent.com/a/ACg8ocLO100hd1cI0s_PzyF5N9bmRAUVDQuR7bCRtCU0QibrdSBi6aw=s96-c	117028535035722287751	GOOGLE
cmfyxc0n20000ohnyxi2i6snj	admin@fitx.dev	$2a$10$xDJfDG1p8iptbm5UZ8Npt.YslpPlD.AdTTFVRkZb.xIhVCfAUm2ia	Admin	ADMIN	ELITE	\N	2025-09-25 04:39:43.166	2025-09-28 16:35:09.473	t	\N	\N	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: fitx
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ff89c333-2e14-41dc-8292-9f5e7656e425	56e734d349f27e82f0bf534e70d59337374bc06a8e3fb35143b8eb541a9095ed	2025-09-25 11:31:45.877202+07	20250924144325_init	\N	\N	2025-09-25 11:31:45.866866+07	1
3e8f15d2-ba96-41c8-a2f1-1ab99e50515c	56b11322ad8935e9c835db1c6bcf56f2301a1ae5d280d159d6b3ad3cef994f95	2025-09-25 11:31:45.880317+07	20250924172609_signup_api_shape	\N	\N	2025-09-25 11:31:45.878121+07	1
9eb81ecc-e1be-4636-8f07-c1228e41222e	2cf5a4a708096ee67e773da2a15401916b8c64b48ee774e7e4b5f73f26938429	2025-09-25 11:31:46.416391+07	20250925043146_init	\N	\N	2025-09-25 11:31:46.413339+07	1
955a72a1-43f1-4054-b199-2adef2cf44f4	b60c704a9394598b2b033f0580dff3a693207bfc77d91ab7e186c617c7c51ae5	2025-09-27 00:01:50.916112+07	20250926170150_google_oauth	\N	\N	2025-09-27 00:01:50.912993+07	1
9a3f4830-a3e0-4472-b814-c8fe0396473a	bac93c52cd1633f140d582e5d98652f7c3678c318875c6efd228f03860d9320a	2025-09-27 01:01:22.204907+07	20250926180122_add_google_auth_fields	\N	\N	2025-09-27 01:01:22.200239+07	1
497d3bc2-8e56-47bd-8570-1727d1b06f09	bb42d3530b4a7e31f3b389a65a35c108fa92976f477efb72ddf9f61d9e0c40be	2025-09-27 01:38:56.677579+07	20250926183856_add_invoice	\N	\N	2025-09-27 01:38:56.668445+07	1
\.


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: fitx
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: Lesson Lesson_pkey; Type: CONSTRAINT; Schema: public; Owner: fitx
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_pkey" PRIMARY KEY (id);


--
-- Name: Program Program_pkey; Type: CONSTRAINT; Schema: public; Owner: fitx
--

ALTER TABLE ONLY public."Program"
    ADD CONSTRAINT "Program_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: fitx
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: fitx
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Program_category_idx; Type: INDEX; Schema: public; Owner: fitx
--

CREATE INDEX "Program_category_idx" ON public."Program" USING btree (category);


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: fitx
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: fitx
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_googleId_key; Type: INDEX; Schema: public; Owner: fitx
--

CREATE UNIQUE INDEX "User_googleId_key" ON public."User" USING btree ("googleId");


--
-- Name: Invoice Invoice_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fitx
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Lesson Lesson_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fitx
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Program Program_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fitx
--

ALTER TABLE ONLY public."Program"
    ADD CONSTRAINT "Program_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO fitx;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: lequangdat
--

ALTER DEFAULT PRIVILEGES FOR ROLE lequangdat IN SCHEMA public GRANT ALL ON SEQUENCES TO fitx;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: lequangdat
--

ALTER DEFAULT PRIVILEGES FOR ROLE lequangdat IN SCHEMA public GRANT ALL ON FUNCTIONS TO fitx;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: lequangdat
--

ALTER DEFAULT PRIVILEGES FOR ROLE lequangdat IN SCHEMA public GRANT ALL ON TABLES TO fitx;


--
-- PostgreSQL database dump complete
--

\unrestrict duQZv1465Ptm569BTQqjAmo0oZBaZ3gSxpFezxRh6i3h4bca6wrvIjxGgoJozUx

