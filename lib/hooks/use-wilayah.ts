"use client";

import { useState, useEffect } from "react";

const BASE_URL = "https://alamat.thecloudalert.com/api";

export interface WilayahOption {
  id: string;
  text: string;
}

async function fetchWilayah(endpoint: string, retries = 2): Promise<WilayahOption[]> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`);
      if (!res.ok) continue;
      const json = await res.json();
      const result = json.result ?? [];
      if (result.length > 0) return result;
    } catch {
      // retry
    }
  }
  return [];
}

export function useProvinsi() {
  const [data, setData] = useState<WilayahOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWilayah("/provinsi/get/")
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}

export function useKabupatenKota(provinsiId: string | null) {
  const [data, setData] = useState<WilayahOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!provinsiId) { setData([]); return; }
    setIsLoading(true);
    fetchWilayah(`/kabkota/get/?d_provinsi_id=${provinsiId}`)
      .then(setData)
      .finally(() => setIsLoading(false));
  }, [provinsiId]);

  return { data, isLoading };
}

export function useKecamatan(kabkotaId: string | null) {
  const [data, setData] = useState<WilayahOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!kabkotaId) { setData([]); return; }
    setIsLoading(true);
    fetchWilayah(`/kecamatan/get/?d_kabkota_id=${kabkotaId}`)
      .then(setData)
      .finally(() => setIsLoading(false));
  }, [kabkotaId]);

  return { data, isLoading };
}

export function useKelurahan(kecamatanId: string | null) {
  const [data, setData] = useState<WilayahOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!kecamatanId) { setData([]); return; }
    setIsLoading(true);
    fetchWilayah(`/kelurahan/get/?d_kecamatan_id=${kecamatanId}`)
      .then(setData)
      .finally(() => setIsLoading(false));
  }, [kecamatanId]);

  return { data, isLoading };
}
