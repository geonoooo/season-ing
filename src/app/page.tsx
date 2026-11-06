import { connection } from "next/server";
import { Suspense } from "react";

import { PlaceBrowse } from "@/c_features/place-browse";
import { parsePlaceCategory } from "@/d_shared/place";

const HomeContent = async ({ searchParams }: Pick<PageProps<"/">, "searchParams">) => {
  const category = parsePlaceCategory((await searchParams).category);
  await connection();
  return (
    <PlaceBrowse key={category} category={category} now={new Date().toISOString()} />
  );
};

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <Suspense>
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}
