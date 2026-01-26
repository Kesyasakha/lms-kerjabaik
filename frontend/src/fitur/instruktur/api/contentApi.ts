import { supabase } from "@/pustaka/supabase";

export type ContentType = "text" | "video" | "file" | "quiz" | "assignment";

export interface Content {
  id: string;
  id_modul: string;
  tipe: ContentType;
  judul: string;
  body: string | null;
  url_berkas: string | null;
  urutan: number;
  created_at: string;
  updated_at: string;
}

export interface CreateContentData {
  tipe: ContentType;
  judul: string;
  body?: string;
  url_berkas?: string;
}

export interface UpdateContentData {
  judul?: string;
  body?: string;
  url_berkas?: string;
}

/**
 * Get all contents for a module
 */
export async function getContents(moduleId: string): Promise<Content[]> {
  const { data, error } = await (supabase.from("materi") as any)
    .select("*")
    .eq("id_modul", moduleId)
    .order("urutan", { ascending: true });

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  return (data || []).map((item: any) => ({
    ...item,
    body: item.konten,
  })) as Content[];
}

/**
 * Create new content
 */
export async function createContent(
  moduleId: string,
  data: CreateContentData,
): Promise<Content> {
  try {
    // Get max urutan
    const { data: maxContent, error: urutanError } = await (supabase.from("materi") as any)
      .select("urutan")
      .eq("id_modul", moduleId)
      .order("urutan", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (urutanError) {
      console.error("Error fetching max urutan:", urutanError);
    }

    const nextUrutan = maxContent ? (maxContent as any).urutan + 1 : 1;

    const insertData = {
      id_modul: moduleId,
      tipe:
        data.tipe === "text"
          ? "teks"
          : data.tipe === "file"
            ? "dokumen"
            : data.tipe,
      judul: data.judul,
      konten: data.body || null,
      url_berkas: data.url_berkas || null,
      urutan: nextUrutan,
    };

    const { data: newContent, error } = await (supabase.from("materi") as any)
      .insert(insertData)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase error during createContent:", error);
      throw error;
    }

    if (!newContent) {
      throw new Error("Gagal membuat materi: Data tidak ditemukan setelah insert");
    }

    return {
      ...newContent,
      body: (newContent as any).konten,
    } as Content;
  } catch (error) {
    console.error("Unexpected error in createContent:", error);
    throw error;
  }
}

/**
 * Update content
 */
export async function updateContent(
  contentId: string,
  data: UpdateContentData,
): Promise<Content> {
  try {
    const updateData = {
      judul: data.judul,
      konten: data.body,
      url_berkas: data.url_berkas,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedContent, error } = await (supabase.from("materi") as any)
      .update(updateData)
      .eq("id", contentId)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase error during updateContent:", error);
      throw error;
    }

    if (!updatedContent) {
      throw new Error("Gagal update materi: Data tidak ditemukan setelah update");
    }

    return {
      ...updatedContent,
      body: (updatedContent as any).konten,
    } as Content;
  } catch (error) {
    console.error("Unexpected error in updateContent:", error);
    throw error;
  }
}

/**
 * Delete content
 */
export async function deleteContent(contentId: string): Promise<void> {
  const { error } = await (supabase.from("materi") as any)
    .delete()
    .eq("id", contentId);

  if (error) throw error;
}

/**
 * Reorder contents
 */
export async function reorderContents(
  moduleId: string,
  contentIds: string[],
): Promise<void> {
  // Batch update
  const updates = contentIds.map((id, index) =>
    (supabase.from("materi") as any)
      .update({ urutan: index + 1 })
      .eq("id", id)
      .eq("id_modul", moduleId),
  );

  await Promise.all(updates);
}
