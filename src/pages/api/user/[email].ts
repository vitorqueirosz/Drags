import { prisma } from 'services/prisma';

import { NextApiRequest, NextApiResponse } from 'next';

export type User = {
  name: string;
  email: string;
};

export default async function handle(
  request: NextApiRequest,
  response: NextApiResponse,
): Promise<void> {
  const { email } = request.query;

  const user = await prisma.user.findUnique({
    where: { email: String(email) },
  });

  return response.json(user);
}
