import styles from './Videos.module.css';

export default function Videos({ videos, onAdd }) {
  return <section className={styles.page}>
    <header><p>REFERENCE LIBRARY</p><h1>参考動画</h1><span>フォームやメニューの参考になる動画を保存します。</span></header>
    <button className={styles.primary} onClick={onAdd}>＋ 動画を保存</button>
    {videos.length === 0 ? <div className={styles.empty}><b>保存した動画はありません</b><p>YouTubeのURLを貼ると、サムネイル付きで保存できます。</p><button onClick={onAdd}>最初の動画を保存 →</button></div> : <div className={styles.grid}>{videos.map(video => <article className={styles.card} key={video.id}>{video.thumbnail ? <img src={video.thumbnail} alt=""/> : <div className={styles.noImage}>LINK</div>}<div className={styles.content}><span>{video.category || '参考動画'}</span><h2>{video.title}</h2><a href={video.url} target="_blank" rel="noreferrer">YouTubeで開く ↗</a></div></article>)}</div>}
  </section>;
}
