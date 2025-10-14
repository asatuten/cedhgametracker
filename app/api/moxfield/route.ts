import { NextResponse } from "next/server";

export const runtime = "edge";

export const POST = async (request: Request) => {
  const { url } = await request.json();
  return NextResponse.json({
    name: "Moxfield deck",
    colorIdentity: "",
    url,
    note: "This is a stub parser. Provide deck info manually if needed."
  });
};
