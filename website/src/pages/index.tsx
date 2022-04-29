import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import FeaturesList from './_features.md';
import Preview from './_preview.md';
import s from './index.module.scss';

export default function Home() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      description={siteConfig.customFields.description}
    >
      <div className={s.preview}>
        <div className={s.m_width}>
          <div className={s.preview_content}>
            <Preview />
          </div>
        </div>
      </div>

      <div className={s.features}>
        <div className={s.m_width}>
          <h2 className={s.features_title}>
            Features
          </h2>
          <ul className={s.features_list}>
            <FeaturesList />
          </ul>
        </div>
      </div>
    </Layout>
  );
}

