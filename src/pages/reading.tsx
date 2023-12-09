import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import readings from "./_readingData";

import styles from "./reading.module.css";
import BrowserOnly from "@docusaurus/BrowserOnly";

export default function Reading(): JSX.Element {
  return (
    <BrowserOnly>
      {() => (
        <div className={clsx(styles.whitePage)}>
          <Checklist />
        </div>
      )}
    </BrowserOnly>
  );
}

function Checklist(): JSX.Element {
  const tableRef = useRef(null);
  const [thumbnails, setThumbnails] = useState(
    !localStorage.getItem("thumbsHidden")
  );
  useScrollPastLaskCheckedCheckbox(tableRef);
  return (
    <table ref={tableRef} className={clsx(styles.table)}>
      <thead>
        <tr>
          <th>☀️ Day</th>
          <th>📖 Reading</th>
          <th>🎵 Psalm</th>
          <th onClick={clickVideoHeader}>
            <img
              className={clsx(styles.bp)}
              alt="Video"
              src="https://ik.imagekit.io/bpweb1/web/media/Brand/logoicontextdark.svg?tr=q-65"
            />
            <span className={clsx(styles.toggleText, styles.mobileHidden)}>
              ({thumbnails ? "hide" : "show"} thumbnails)
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        {readings.map((r) => (
          <ReadingRow
            key={`${r[0]}`}
            reading={r}
            videoThumbnails={thumbnails}
          />
        ))}
      </tbody>
    </table>
  );

  function clickVideoHeader() {
    setThumbnails((x) => {
      if (x) {
        localStorage.setItem("thumbsHidden", "1");
      } else {
        localStorage.removeItem("thumbsHidden");
      }
      return !x;
    });
  }
}

function useScrollPastLaskCheckedCheckbox(elementRef) {
  let timeout = null;
  useEffect(() => {
    if (!elementRef.current) return;
    function scrollSoon() {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        const inputs = Array.from(
          elementRef.current.getElementsByTagName("input")
        );
        const checked = inputs.filter((x) => x.checked);
        if (checked.length) {
          const last = checked[checked.length - 1];
          last.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);
    }
    scrollSoon();
    const mo = new MutationObserver(scrollSoon);
    mo.observe(elementRef.current, { childList: true });
    return () => {
      if (timeout) clearTimeout(timeout);
      mo.disconnect();
    };
  }, []);
}

function ReadingRow({ reading, videoThumbnails }) {
  return (
    <tr>
      <td>{reading[0]}</td>
      <td>
        <CheckBox part="main" day={reading[0]}>
          {reading[1]}
        </CheckBox>
      </td>
      <td>
        <CheckBox part="psalm" day={reading[0]}>
          {reading[2]}
        </CheckBox>
      </td>
      <td>
        {reading[4] && (
          <Video
            video={reading[4]}
            title={reading[3]}
            thumbnail={videoThumbnails}
          />
        )}
      </td>
    </tr>
  );
}

interface CheckBoxProps {
  part: string;
  day: string;
  children?: any;
}
function CheckBox({ part, day, children }: CheckBoxProps) {
  const key = `${day}-${part}`;
  const [checked, setChecked] = useState(!!localStorage.getItem(key));
  return (
    <label>
      <input
        type="checkbox"
        onChange={toggle}
        className={clsx(styles.checkbox)}
        checked={!!checked}
      />
      {children}
    </label>
  );

  function toggle(e) {
    const { checked } = e.currentTarget;
    if (checked) {
      localStorage.setItem(key, "1");
    } else {
      localStorage.removeItem(key);
    }
    setChecked(checked);
  }
}

interface VideoProps {
  video: any;
  title?: string;
  thumbnail: boolean;
}
function Video({ video, title, thumbnail }: VideoProps) {
  function abbrev(title: string) {
    const replacements = [
      [/&quot;/g, '"'],
      [/&#39;/g, "'"],
    ];
    if (title.includes(":")) {
      title = title.substring(0, title.indexOf(":"));
    }
    if (title.includes("•")) {
      title = title.substring(0, title.indexOf("•"));
    }
    replacements.forEach((r) => (title = title.replace(r[0], r[1])));
    return title;
  }
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.videoId}`}
      target="_blank"
    >
      {thumbnail && <img src={video.thumbnails?.medium?.url} />}
      <span className={thumbnail ? clsx(styles.mobileHidden) : ""}>
        {title || abbrev(video.title)}
      </span>
    </a>
  );
}
