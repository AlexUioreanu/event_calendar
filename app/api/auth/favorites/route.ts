import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";

const handleError = (error: any, message: string) => {
  console.error(message, error);
  return NextResponse.json({ message }, { status: 500 });
};

export async function PUT(req: Request) {
  const { movieId } = await req.json();
  const session = await getServerSession();
  const userEmail = session?.user?.email;

  try {
    const existingFavorite = await sql`
      SELECT * FROM user_favorites
      WHERE user_email = ${userEmail} AND movie_id = ${movieId}
    `;

    if (existingFavorite.rows.length > 0) {
      return NextResponse.json(
        { message: "Favorite already exist's " },
        { status: 400 }
      );
    }

    const updateResponse = await sql`
      INSERT INTO user_favorites (user_email, movie_id)
      VALUES (${userEmail},${movieId})
    `;

    if (updateResponse.rowCount > 0) {
      return NextResponse.json({ message: "Favorite added successfully" });
    } else {
      return NextResponse.json(
        { message: "Favorite update failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    return handleError(error, "Error updating favorite");
  }
}

export async function DELETE(request: Request) {
  const { movieId } = await request.json();
  const session = await getServerSession();
  const userEmail = session?.user?.email;

  try {
    const updateResponse = await sql`
     DELETE FROM user_favorites WHERE user_email = ${userEmail} AND movie_id = ${movieId} ;
    `;

    if (updateResponse.rowCount > 0) {
      return NextResponse.json({ message: "Favorite removed successfully" });
    } else {
      return NextResponse.json(
        { message: "Favorite not found or failed to remove" },
        { status: 404 }
      );
    }
  } catch (error) {
    return handleError(error, "Error removing favorite");
  }
}

export const GET = async (req: Request, res: Response) => {
  try {
    const session = await getServerSession();

    const userEmail = session?.user?.email;

    const result = await sql`
      SELECT movie_id FROM user_favorites WHERE user_email = ${userEmail}
    `;
    const movieIds = result.rows.map((row) => row.movie_id);

    if (movieIds.length > 0) {
      return NextResponse.json(
        {
          message: "Favorite list success get",
          movieIds,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          message: "Error getting favorite list",
          data: movieIds,
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error getting favorite movies list:", error);
    return NextResponse.json({
      message: "Error getting favorite movies listsss",
    });
  }
};
