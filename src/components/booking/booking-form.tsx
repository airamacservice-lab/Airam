"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronDown, Loader2, MessageCircle } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { waBooking } from "@/lib/whatsapp";

const bookingSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  area: z.string().min(1, "Select your area"),
  service: z.string().min(1, "Select a service"),
  website: z.string().max(0).optional(), // honeypot
});

type BookingInput = z.infer<typeof bookingSchema>;

export type BookingOption = { value: string; label: string };

const inputCls =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-ink-900 placeholder:text-ink-400 transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none";

export function BookingForm({
  services,
  areas,
  defaultService,
  defaultArea,
  compact = false,
}: {
  services: BookingOption[];
  areas: BookingOption[];
  defaultService?: string;
  defaultArea?: string;
  compact?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [submitted, setSubmitted] = useState<BookingInput | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      service: defaultService ?? "",
      area: defaultArea ?? "",
    },
  });

  async function onSubmit(data: BookingInput) {
    setStatus("sending");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Booking failed (${res.status})`);
      setSubmitted(data);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done" && submitted) {
    const serviceLabel =
      services.find((s) => s.value === submitted.service)?.label ??
      submitted.service;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 rounded-2xl border border-teal-100 bg-teal-50 p-8 text-center"
      >
        <span className="grid size-14 place-items-center rounded-full bg-teal-500 text-white">
          <CheckCircle2 className="size-7" aria-hidden />
        </span>
        <div>
          <h3 className="text-lg font-bold text-ink-900">
            Request received, {submitted.name.split(" ")[0]}
          </h3>
          <p className="mt-1 text-sm text-ink-500">
            We&rsquo;ll call {submitted.phone} within 15 minutes during working
            hours to confirm your slot.
          </p>
        </div>
        <Button
          href={waBooking(serviceLabel, submitted.area)}
          external
          variant="whatsapp"
          size="md"
        >
          <MessageCircle className="size-4" aria-hidden />
          Confirm faster on WhatsApp
        </Button>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cn("grid gap-3.5", compact ? "" : "sm:grid-cols-2")}
    >
      <div className={compact ? "" : "sm:col-span-1"}>
        <input
          {...register("name")}
          placeholder="Your name"
          autoComplete="name"
          className={inputCls}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="mt-1.5 text-xs font-medium text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className={compact ? "" : "sm:col-span-1"}>
        <input
          {...register("phone")}
          placeholder="10-digit mobile number"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={10}
          className={inputCls}
          aria-invalid={!!errors.phone}
        />
        {errors.phone && (
          <p className="mt-1.5 text-xs font-medium text-red-600">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className={cn("relative", compact ? "" : "sm:col-span-1")}>
        <select
          {...register("area")}
          className={cn(inputCls, "appearance-none pr-10")}
          aria-invalid={!!errors.area}
          defaultValue={defaultArea ?? ""}
        >
          <option value="" disabled>
            Your area
          </option>
          {areas.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
          <option value="Other">Other / nearby area</option>
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-400"
          aria-hidden
        />
        {errors.area && (
          <p className="mt-1.5 text-xs font-medium text-red-600">
            {errors.area.message}
          </p>
        )}
      </div>

      <div className={cn("relative", compact ? "" : "sm:col-span-1")}>
        <select
          {...register("service")}
          className={cn(inputCls, "appearance-none pr-10")}
          aria-invalid={!!errors.service}
          defaultValue={defaultService ?? ""}
        >
          <option value="" disabled>
            What do you need?
          </option>
          {services.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-400"
          aria-hidden
        />
        {errors.service && (
          <p className="mt-1.5 text-xs font-medium text-red-600">
            {errors.service.message}
          </p>
        )}
      </div>

      {/* Honeypot — hidden from humans, catches naive bots */}
      <input
        {...register("website")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <div className={compact ? "" : "sm:col-span-2"}>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={status === "sending"}
        >
          {status === "sending" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Booking…
            </>
          ) : (
            "Book my service"
          )}
        </Button>
        {status === "error" && (
          <p className="mt-2 text-center text-xs font-medium text-red-600">
            Something went wrong. Call {site.phone} or use WhatsApp — we
            respond immediately.
          </p>
        )}
        <p className="mt-2.5 text-center text-xs text-ink-400">
          No advance payment. We call back within 15 minutes.
        </p>
      </div>
    </form>
  );
}
