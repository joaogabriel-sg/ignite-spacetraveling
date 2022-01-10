/* eslint-disable react/no-danger */

import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import formatDate from '../../utils/formatDate';
import getAmountOfWords from '../../utils/getAmountOfWords';

import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Comments from '../../components/Comments';

interface Post {
  first_publication_date: string | null;
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

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
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
            <Comments />
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

export const getStaticProps: GetStaticProps<PostProps> = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: { post: response },
    revalidate: 60 * 30, // 30 minutes
  };
};
