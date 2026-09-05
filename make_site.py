"""
사이트용 데이터 만들기
------------------------------------------------
data 폴더의 JSON들을 사이트에서 쓸 수 있는 형태로 압축합니다.
site/data.js 하나가 만들어집니다.

실행:  python make_site.py
"""

import glob
import json
import os
from datetime import datetime, timezone, timedelta
from collections import defaultdict

OUT_DIR = "site"

AGES = {
    "hot_all": "전체",
    "hot_teens": "10대",
    "hot_20s": "20대",
    "hot_30s": "30대",
    "hot_40s": "40대",
    "hot_50s_plus": "50대이상",
}

# 첫 수집일에 그날 출시된 개수(직접 확인한 값).
# 그 뒤 순위의 항목들은 언제 나왔는지 알 수 없습니다.
FIRST_DAY_NEW_COUNT = 18


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    raw = defaultdict(dict)          # (날짜, 목록) → [항목...]
    for path in sorted(glob.glob(os.path.join("data", "*", "*.json"))):
        d = json.load(open(path, encoding="utf-8"))
        items = []
        for page in d["pages"]:
            items.extend(page["body"].get("items", []))
        raw[d["collected_at"][:10]][d["target"]] = items

    dates = sorted(raw)

    # 항목마다 번호를 붙여서 목록은 번호만 담습니다. 파일이 훨씬 작아집니다.
    index = {}
    meta = []

    def idx_of(item):
        slug = item["slug"]
        if slug not in index:
            flags = (1 if item.get("isMini") else 0)
            flags |= (2 if item.get("isBig") else 0)
            flags |= (4 if item.get("isSound") else 0)
            # 움직이는 이모티콘은 재생 이미지 주소 끝이 -g 입니다
            flags |= (8 if item.get("playImageUrl", "").endswith("-g") else 0)
            index[slug] = len(meta)
            # 썸네일은 주소 전체 대신 뒷부분만 저장합니다(파일 크기 절약).
            thumb = item.get("stillImageUrl", "").rsplit("/", 1)[-1]
            meta.append([slug, item["title"], item["creatorName"],
                         item["creatorId"], flags, thumb, item["ipName"]])
        return index[slug]

    hot = {label: [] for label in AGES.values()}
    new_flag = []          # 날짜별로 '신규' 배지가 붙어 있던 항목들
    new_seen = {}          # 항목 → 신규목록에 처음 나온 날짜

    for date in dates:
        day = raw[date]
        flagged = set()

        for target, label in AGES.items():
            row = []
            for item in day.get(target, []):
                i = idx_of(item)
                row.append(i)
                if item.get("isNew"):
                    flagged.add(i)
            hot[label].append(row)

        for rank, item in enumerate(day.get("new_all", []), start=1):
            i = idx_of(item)
            if item.get("isNew"):
                flagged.add(i)
            if i not in new_seen:
                # 첫 수집일에 이미 있던 것 중 상위 18개만 그날 출시로 봅니다
                if date == dates[0] and rank > FIRST_DAY_NEW_COUNT:
                    new_seen[i] = None
                else:
                    new_seen[i] = date

        new_flag.append(sorted(flagged))

    # 출시일 → 날짜 번호 (모르면 -1)
    release = [-1] * len(meta)
    for i, date in new_seen.items():
        release[i] = dates.index(date) if date else -1

    payload = {
        "dates": dates,
        "ages": list(AGES.values()),
        "items": meta,
        "hot": hot,
        "newFlag": new_flag,
        "release": release,
        "generatedAt": datetime.now(timezone(timedelta(hours=9))).strftime("%Y-%m-%d %H:%M"),
        "thumbBase": "https://item.kakaocdn.net/do/",
    }

    path = os.path.join(OUT_DIR, "data.js")
    with open(path, "w", encoding="utf-8") as f:
        f.write("window.DATA = ")
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";")

    size = os.path.getsize(path) / 1024
    print(f"{path}  ({size:.0f}KB)")
    print(f"  날짜 {len(dates)}일 / 이모티콘 {len(meta):,}개")
    print(f"  출시일 확인 {sum(1 for r in release if r >= 0):,}개")


if __name__ == "__main__":
    main()
