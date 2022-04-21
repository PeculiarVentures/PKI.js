import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import s from './index.module.scss';

export default function Home() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      description={siteConfig.customFields.description}
      wrapperClassName={s.wrapper}
    >
      <div className={s.content}>
        <h1 className={s.title}>
          PKIjs provides a Typescript implementation of the most common formats and algorithms needed to build PKI-enabled applications.
        </h1>
        <p>
          We created PKIjs to make it easy to build modern web applications that can interoperate with existing X.509 solutions. It is built on top of Web Crypto so that these applications get to rely on the quality cryptographic implementations provided by browsers and Node.js.
        </p>
      </div>
    </Layout>
  );
}

