import { useEffect } from 'react';

export default function Comments(): JSX.Element {
  useEffect(() => {
    const script = document.createElement('script');

    script.src = 'https://utteranc.es/client.js';
    script.async = true;
    script.setAttribute('repo', process.env.NEXT_PUBLIC_UTTERANC_GITHUB_REPO);
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('label', 'Comment');
    script.setAttribute('theme', 'dark-blue');
    script.setAttribute('crossorigin', 'anonymous');

    const scriptParentNode = document.getElementById('comments');
    scriptParentNode.appendChild(script);

    return () => {
      scriptParentNode.removeChild(scriptParentNode.firstChild);
    };
  });

  return <div id="comments" />;
}
