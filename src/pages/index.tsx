import { useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import Header from '../components/Header';
import PreviewButton from '../components/PreviewButton';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import formatDate from '../utils/formatDate';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  isPreviewMode: boolean;
  postsPagination: PostPagination;
}

export default function Home({
  isPreviewMode,
  postsPagination,
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handleLoadMorePosts(): Promise<void> {
    const response = await fetch(nextPage);
    const data = (await response.json()) as PostPagination;

    setPosts(prevPosts => [...prevPosts, ...data.results]);
    setNextPage(data.next_page);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Posts | spacetraveling</title>
      </Head>

      <Header />

      <main className={commonStyles.content}>
        <ul className={styles.posts}>
          {posts.map(post => (
            <li key={post.uid} className={styles.post}>
              <Link href={`/post/${post.uid}`}>
                <a>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <footer>
                    {!!post.first_publication_date && (
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
                  </footer>
                </a>
              </Link>
            </li>
          ))}
        </ul>

        {!!nextPage && (
          <button
            type="button"
            className={styles.loadMoreButton}
            onClick={handleLoadMorePosts}
          >
            Carregar mais posts
          </button>
        )}

        {isPreviewMode && (
          <div className={styles.previewContainer}>
            <PreviewButton />
          </div>
        )}
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 2,
    }
  );

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(result => ({
      uid: result.uid,
      first_publication_date: result.first_publication_date,
      data: {
        author: result.data.author,
        subtitle: result.data.subtitle,
        title: result.data.title,
      },
    })),
  };

  return {
    props: {
      isPreviewMode: preview,
      postsPagination,
    },
    revalidate: 60 * 1, // 1 minute
  };
};
