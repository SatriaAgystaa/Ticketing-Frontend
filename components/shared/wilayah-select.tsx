"use client";

import { useState, useEffect } from "react";
import { Select } from "@/components/ui/select";
import {
  useProvinsi,
  useKabupatenKota,
  useKecamatan,
  useKelurahan,
} from "@/lib/hooks/use-wilayah";

export interface WilayahValue {
  province: string;
  province_id: string;
  city: string;
  city_id: string;
  district: string;
  district_id: string;
  subdistrict: string;
  subdistrict_id: string;
}

interface WilayahSelectProps {
  value?: Partial<WilayahValue>;
  onChange: (value: WilayahValue) => void;
  errors?: {
    province?: string;
    city?: string;
    district?: string;
    subdistrict?: string;
  };
}

export function WilayahSelect({ value, onChange, errors }: WilayahSelectProps) {
  const [provinsiId, setProvinsiId] = useState<string | null>(null);
  const [kabkotaId, setKabkotaId] = useState<string | null>(null);
  const [kecamatanId, setKecamatanId] = useState<string | null>(null);

  const { data: provinsiList, isLoading: loadingProv } = useProvinsi();
  const { data: kabkotaList, isLoading: loadingKab } = useKabupatenKota(provinsiId);
  const { data: kecamatanList, isLoading: loadingKec } = useKecamatan(kabkotaId);
  const { data: kelurahanList, isLoading: loadingKel } = useKelurahan(kecamatanId);

  // Sync IDs when lists load (for edit form pre-fill)
  useEffect(() => {
    if (!value?.province || !provinsiList.length || provinsiId) return;
    const match = provinsiList.find((p) => p.text === value.province);
    if (match) setProvinsiId(match.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinsiList, value?.province]);

  useEffect(() => {
    if (!value?.city || !kabkotaList.length || kabkotaId) return;
    const match = kabkotaList.find((k) => k.text === value.city);
    if (match) setKabkotaId(match.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kabkotaList, value?.city]);

  useEffect(() => {
    if (!value?.district || !kecamatanList.length || kecamatanId) return;
    const match = kecamatanList.find((k) => k.text === value.district);
    if (match) setKecamatanId(match.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kecamatanList, value?.district]);

  const current: WilayahValue = {
    province: value?.province ?? "",
    province_id: provinsiId ?? "",
    city: value?.city ?? "",
    city_id: kabkotaId ?? "",
    district: value?.district ?? "",
    district_id: kecamatanId ?? "",
    subdistrict: value?.subdistrict ?? "",
    subdistrict_id: "",
  };

  function handleProvinsi(id: string) {
    const found = provinsiList.find((p) => p.id === id);
    setProvinsiId(id);
    setKabkotaId(null);
    setKecamatanId(null);
    onChange({
      ...current,
      province: found?.text ?? "",
      province_id: id,
      city: "",
      city_id: "",
      district: "",
      district_id: "",
      subdistrict: "",
      subdistrict_id: "",
    });
  }

  function handleKabkota(id: string) {
    const found = kabkotaList.find((k) => k.id === id);
    setKabkotaId(id);
    setKecamatanId(null);
    onChange({
      ...current,
      city: found?.text ?? "",
      city_id: id,
      district: "",
      district_id: "",
      subdistrict: "",
      subdistrict_id: "",
    });
  }

  function handleKecamatan(id: string) {
    const found = kecamatanList.find((k) => k.id === id);
    setKecamatanId(id);
    onChange({
      ...current,
      district: found?.text ?? "",
      district_id: id,
      subdistrict: "",
      subdistrict_id: "",
    });
  }

  function handleKelurahan(id: string) {
    const found = kelurahanList.find((k) => k.id === id);
    onChange({
      ...current,
      subdistrict: found?.text ?? "",
      subdistrict_id: id,
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Select
            id="venue_province"
            label="Provinsi *"
            placeholder={loadingProv ? "Memuat data wilayah..." : provinsiList.length === 0 ? "Gagal memuat — coba refresh" : "Pilih provinsi"}
            options={provinsiList.map((p) => ({ value: p.id, label: p.text }))}
            value={provinsiId ?? ""}
            onChange={(e) => handleProvinsi(e.target.value)}
            disabled={loadingProv}
            error={errors?.province}
          />
          {!loadingProv && value?.province && !provinsiId && (
            <p className="text-xs text-gray-500">Nilai saat ini: <span className="font-medium">{value.province}</span></p>
          )}
        </div>
        <Select
          id="venue_city"
          label="Kabupaten / Kota *"
          placeholder={
            !provinsiId ? "Pilih provinsi dulu" : loadingKab ? "Memuat..." : "Pilih kab/kota"
          }
          options={kabkotaList.map((k) => ({ value: k.id, label: k.text }))}
          value={kabkotaId ?? ""}
          onChange={(e) => handleKabkota(e.target.value)}
          disabled={!provinsiId || loadingKab}
          error={errors?.city}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="venue_district"
          label="Kecamatan (opsional)"
          placeholder={
            !kabkotaId ? "Pilih kab/kota dulu" : loadingKec ? "Memuat..." : "Pilih kecamatan"
          }
          options={kecamatanList.map((k) => ({ value: k.id, label: k.text }))}
          value={kecamatanId ?? ""}
          onChange={(e) => handleKecamatan(e.target.value)}
          disabled={!kabkotaId || loadingKec}
          error={errors?.district}
        />
        <Select
          id="venue_subdistrict"
          label="Kelurahan (opsional)"
          placeholder={
            !kecamatanId ? "Pilih kecamatan dulu" : loadingKel ? "Memuat..." : "Pilih kelurahan"
          }
          options={kelurahanList.map((k) => ({ value: k.id, label: k.text }))}
          value={value?.subdistrict_id ?? ""}
          onChange={(e) => handleKelurahan(e.target.value)}
          disabled={!kecamatanId || loadingKel}
          error={errors?.subdistrict}
        />
      </div>
    </div>
  );
}
