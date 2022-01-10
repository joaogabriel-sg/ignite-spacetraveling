import { useEffect, useRef } from 'react';

export default function Comments(): JSX.Element {
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (commentsRef) {
      const script = document.createElement('script');
      script.setAttribute('src', 'https://utteranc.es/client.js');
      script.setAttribute('crossorigin', 'anonymous');
      script.setAttribute('async', 'true');
      script.setAttribute('repo', process.env.NEXT_PUBLIC_UTTERANC_GITHUB_REPO);
      script.setAttribute('issue-term', 'pathname');
      script.setAttribute('theme', 'photon-dark');

      commentsRef.current.appendChild(script);
    }
  }, []);

  return <div ref={commentsRef} />;
}
