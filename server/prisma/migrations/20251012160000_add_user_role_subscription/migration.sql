-- Prisma Migration: add user role/active/subscription fields
-- This migration is idempotent and safe to run multiple times.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'USER',
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "avatarUrl" text,
  ADD COLUMN IF NOT EXISTS "subscriptionPlan" text,
  ADD COLUMN IF NOT EXISTS "subscriptionBilling" text,
  ADD COLUMN IF NOT EXISTS "subscriptionSince" timestamptz;