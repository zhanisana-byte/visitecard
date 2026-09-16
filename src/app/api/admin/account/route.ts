import { NextResponse } from "next/server";
import { requireAdmin } from "../_auth";

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin(request);

    if (!auth) {
      return NextResponse.json(
        { error: "Accès administrateur refusé." },
        { status: 403 }
      );
    }

    const { supabase, user } = auth;
    const body = await request.json().catch(() => ({}));

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!email && !password) {
      return NextResponse.json(
        { error: "Aucune modification." },
        { status: 400 }
      );
    }

    if (password && password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Le mot de passe doit contenir au moins 8 caractères.",
        },
        { status: 400 }
      );
    }

    const updates: {
      email?: string;
      password?: string;
    } = {};

    if (email) updates.email = email;
    if (password) updates.password = password;

    const { data, error } =
      await supabase.auth.admin.updateUserById(user.id, updates);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      email: data.user.email,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Modification impossible.",
      },
      { status: 500 }
    );
  }
}
