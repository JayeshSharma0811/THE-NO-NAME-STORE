import { supabase } from "../lib/supabase";

export default async function SupabaseTestPage() {
  const { data, error } = await supabase
    .from("products")
    .select("*");

  if (error) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] p-10 text-[#111111]">
        <h1 className="text-3xl font-semibold">
          Supabase Connection Failed ❌
        </h1>

        <pre className="mt-6 whitespace-pre-wrap rounded-lg bg-red-100 p-5 text-sm text-red-700">
          {error.message}
        </pre>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] p-10 text-[#111111]">
      <h1 className="text-3xl font-semibold">
        Supabase Connected Successfully ✅
      </h1>

      <p className="mt-4 text-black/60">
        Products found: {data?.length ?? 0}
      </p>

      <pre className="mt-6 overflow-auto rounded-lg bg-white p-5 text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}