/* eslint-disable react/no-danger */

import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import formatDate from '../../utils/formatDate';
import getAmountOfWords from '../../utils/getAmountOfWords';

import Header from '../../components/Header';
import Comments from '../../components/Comments';
import PreviewButton from '../../components/PreviewButton';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PrevAndNextPost {
  uid?: string;
  data: {
    title: string;
  };
}

interface PostProps {
  isPreviewMode: boolean;
  post: Post;
  prevPost: PrevAndNextPost;
  nextPost: PrevAndNextPost;
}

export default function Post({
  isPreviewMode,
  post,
  prevPost,
  nextPost,
}: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className={styles.loadContainer}>
        <strong>Carregando...</strong>
      </div>
    );
  }

  const amountWordsOfHeading = post.data.content.reduce(
    (acc, { heading }) => acc + getAmountOfWords(heading),
    0
  );

  const amountWordsOfBody = post.data.content.reduce(
    (acc, { body }) => acc + getAmountOfWords(RichText.asText(body)),
    0
  );

  const amountWordsContent = amountWordsOfHeading + amountWordsOfBody;
  const readingTime = Math.ceil(amountWordsContent / 200);

  const isEdited = post.first_publication_date !== post.last_publication_date;

  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>

      <Header />

      <main>
        <figure className={styles.bannerContainer}>
          <img src={post.data.banner.url} alt={post.data.title} />
        </figure>

        <article className={`${commonStyles.content} ${styles.article}`}>
          <header>
            <h1>{post.data.title}</h1>

            <section>
              {post.first_publication_date && (
                <div>
                  <FiCalendar />
                  <time dateTime={post.first_publication_date}>
                    {formatDate(post.first_publication_date)}
                  </time>
                </div>
              )}
              <div>
                <FiUser />
                <span>{post.data.author}</span>
              </div>
              <div>
                <FiClock />
                <span>{readingTime} min</span>
              </div>
            </section>

            {isEdited && (
              <time
                dateTime={post.last_publication_date}
                className={styles.lastPublicationDate}
              >
                {formatDate(
                  post.last_publication_date,
                  "'* editado em' dd MMM yyyy', às' HH:mm"
                )}
              </time>
            )}
          </header>

          <div className={styles.postContentContainer}>
            {post.data.content.map(content => (
              <section key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </section>
            ))}
          </div>

          <div className={styles.divider} />

          <footer>
            <section>
              {!!prevPost && (
                <Link href={`/post/${prevPost.uid}`}>
                  <a className={styles.prevPost}>
                    <span>{prevPost.data.title}</span>
                    <strong>Post anterior</strong>
                  </a>
                </Link>
              )}

              {!!nextPost && (
                <Link href={`/post/${nextPost.uid}`}>
                  <a className={styles.nextPost}>
                    <span>{nextPost.data.title}</span>
                    <strong>Próximo post</strong>
                  </a>
                </Link>
              )}
            </section>

            <Comments />

            {isPreviewMode && (
              <div className={styles.previewContainer}>
                <PreviewButton />
              </div>
            )}
          </footer>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const prevResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      fetch: ['post.title'],
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const nextResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      fetch: ['post.title'],
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
    }
  );

  return {
    props: {
      isPreviewMode: preview,
      post: response,
      prevPost: prevResponse.results[0] || null,
      nextPost: nextResponse.results[0] || null,
    },
    revalidate: 60 * 5, // 5 minutes
  };
};
