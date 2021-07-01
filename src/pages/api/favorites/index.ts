/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from 'services/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { Character } from 'pages/characters';

type Char = {
  id: number;
  charId: string;
  priority: number;
};

export default async function handle(
  request: NextApiRequest,
  response: NextApiResponse,
): Promise<void> {
  const { characters, email } = request.body;

  const newChars: Character[] = characters.filter(
    ({ charId }: Character) => !charId,
  );

  newChars.forEach(async ({ id, image, name, priority }) => {
    const charExists = await prisma.char.findFirst({
      where: {
        charId: id as any,
      },
    });

    if (charExists) {
      const hasFavoriteChar = await prisma.favorites.findFirst({
        where: {
          charId: charExists.id,
          user: { email },
        },
      });

      if (hasFavoriteChar) {
        return prisma.favorites.update({
          where: {
            id: hasFavoriteChar.id,
          },
          data: {
            priority: priority as any,
          },
        });
      }

      return prisma.favorites.create({
        data: {
          user: { connect: { email } },
          char: { connect: { id: charExists.id } },
          priority,
        },
      });
    }

    const char = await prisma.char.create({
      data: {
        image,
        name,
        charId: id,
      },
    });

    await prisma.favorites.create({
      data: {
        user: { connect: { email } },
        char: { connect: { id: char.id } },
        priority,
      },
    });
  });

  const existedChars: Char[] = characters.filter(
    ({ charId }: Character) => charId,
  );

  existedChars.forEach(async ({ id, priority }: Char) => {
    const hasFavoriteChar = await prisma.favorites.findFirst({
      where: {
        charId: id,
      },
    });

    if (hasFavoriteChar) {
      return prisma.favorites.update({
        where: {
          id: hasFavoriteChar.id,
        },
        data: {
          priority,
        },
      });
    }

    await prisma.favorites.create({
      data: {
        user: { connect: { email } },
        char: { connect: { id } },
        priority,
      },
    });
  });

  return response.json([]);
}
