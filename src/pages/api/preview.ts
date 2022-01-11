/* eslint-disable consistent-return */
import { NextApiRequest, NextApiResponse } from 'next';

import { getPrismicClient } from '../../services/prismic';

interface Doc {
  type: string;
  uid: string;
}

interface Query {
  token: string;
  documentId: string;
}

function linkResolver(doc: Doc): string {
  return doc.type === 'posts' ? `/post/${doc.uid}` : '/';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { token: ref, documentId } = req.query as unknown as Query;

  const prismic = getPrismicClient(req);
  const redirectUrl = await prismic
    .getPreviewResolver(ref, documentId)
    .resolve(linkResolver, '/');

  if (!redirectUrl) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.setPreviewData({ ref });

  res.write(
    `<!DOCTYPE html><html><head><meta http-equiv="Refresh" content="0; url=${redirectUrl}" />
    <script>window.location.href = '${redirectUrl}'</script>
    </head>`
  );

  res.end();
}
