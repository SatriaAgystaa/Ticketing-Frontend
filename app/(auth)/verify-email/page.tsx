"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    // hanya terima 1 digit angka
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    // auto focus ke input berikutnya
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill("");
    pasted.split("").forEach((char, i) => { next[i] = char; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  const otpCode = otp.join("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otpCode.length !== 6) {
      toast.error("Masukkan 6 digit kode OTP");
      return;
    }
    setIsSubmitting(true);
    try {
      await authApi.verifyEmail(email, otpCode);
      toast.success("Email berhasil diverifikasi! Silakan login.");
      router.push("/login");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "OTP tidak valid atau sudah kadaluarsa");
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || !email) return;
    setIsResending(true);
    try {
      await authApi.resendVerification(email);
      toast.success("Kode OTP baru telah dikirim ke email kamu");
      // mulai countdown 60 detik
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Gagal mengirim ulang OTP");
    } finally {
      setIsResending(false);
    }
  }

  if (!email) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verifikasi Email</CardTitle>
          <CardDescription>Email tidak ditemukan</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-gray-500">
            Silakan daftar ulang atau minta kirim ulang dari halaman login.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Link href="/register"><Button variant="secondary">Daftar Ulang</Button></Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verifikasi Email</CardTitle>
        <CardDescription>
          Masukkan kode 6 digit yang dikirim ke{" "}
          <span className="font-medium text-gray-900">{email}</span>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* OTP Input */}
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-14 w-12 rounded-lg border border-gray-200 bg-white text-center text-2xl font-bold text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            ))}
          </div>

          <p className="text-center text-xs text-gray-500">
            Kode berlaku selama 10 menit. Periksa folder spam jika tidak menemukan email.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            disabled={otpCode.length !== 6}
          >
            Verifikasi
          </Button>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="text-sm text-gray-500 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resendCooldown > 0
              ? `Kirim ulang dalam ${resendCooldown}s`
              : isResending
              ? "Mengirim..."
              : "Tidak menerima kode? Kirim ulang"}
          </button>
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Sudah punya akun? Login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardContent className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
          </CardContent>
        </Card>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
