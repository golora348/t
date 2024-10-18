let data = []; // CSV 데이터 저장
let timeout; // 입력 대기 시간
let totalImages = 0; // 총 이미지 수
let loadedImages = 0; // 로드된 이미지 수
let imagesCache = {}; // 이미지 캐시
let isLoading = true; // 로딩 상태
let currentServer = "./KR_DB.csv"; // 기본 서버 설정
let historyDataKR = []; // 진행 내역 - 한국 서버 데이터 저장
let historyDataJP = []; // 진행 내역 - 일본 서버 데이터 저장

// 뷰포트 높이에 기반한 CSS 변수 '--vh'를 설정하는 함수
function setDynamicVh() {
  // 현재 창의 높이를 1vh로 변환 (1vh = 1%의 창 높이)
  const vh = window.innerHeight * 0.01;

  // '--vh' 변수 설정
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

// 초기 '--vh' 값 설정
setDynamicVh();

// WebP 지원에 따라 로딩 이미지 설정
function setLoadingImage() {
  const loadingImage = document.getElementById("loadingImage");

  if (supportsWebP()) {
    loadingImage.src = "./ezgif-7-97aa7e00b3.webp"; // WebP가 지원되는 경우
  } else {
    loadingImage.src = "./ezgif-7-f1b595243f.gif"; // WebP가 지원되지 않는 경우
  }
}

// 로딩 이미지 설정 함수 호출
setLoadingImage();

// WebP 지원 여부 확인
function supportsWebP() {
  const canvas = document.createElement("canvas");
  return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
}

// 서버에서 데이터 로드
const loadData = async (server) => {
  console.log("");
  console.log("[SYSTEM] 데이터 로딩 중...");
  console.log("［SYSTEM］データをロード中...");
  const response = await fetch(server);
  const text = await response.text();
  data = parseCSV(text); // CSV 파싱
  console.log("[SYSTEM] 데이터 로딩 완료.");
  console.log("［SYSTEM］データのロードが完了しました。");
  preloadImages();
};

// CSV 데이터 파싱
const parseCSV = (text) => {
  const lines = text.trim().split("\n");

  // 첫 번째 행 생략 (index 1부터 시작)
  return lines.slice(1).map((line, index) => {
    const items = [];
    let insideQuotes = false;
    let currentItem = "";

    for (const char of line) {
      if (char === '"') insideQuotes = !insideQuotes;
      else if (char === "," && !insideQuotes) {
        items.push(currentItem.trim());
        currentItem = "";
      } else {
        currentItem += char;
      }
    }
    items.push(currentItem.trim());
    items.row = index; // 행 번호 추가 (0부터 시작)
    return items;
  });
};

// 이미지 사전 로드
const preloadImages = () => {
  // 추가 이미지
  const additionalImages = [
    "./bg_530300.png",
    "./JP_srt_top_title.png",
    "./JP_srt_wordlist_label_back.png",
    "./JP_srt_wordlist_label_princess.png",
    "./srt_panel_10126_JP.png",
    "./KR_srt_top_title.png",
    "./KR_srt_wordlist_label_back.png",
    "./KR_srt_wordlist_label_princess.png",
  ];

  totalImages = data.length - 1 + additionalImages.length;
  loadedImages = 0;

  data.forEach((item, index) => {
    if (index > 0) {
      const imgId =
        currentServer === "./KR_DB.csv" ? item[3] : item[2];
      loadImage(`./srt_panel_${imgId}.png`);
    }
  });

  additionalImages.forEach((src) => {
    loadImage(src);
    const img = new Image();
    img.src = src;
    imagesCache[src] = img;
  });
};

// 개별 이미지 로드
const loadImage = (src) => {
  const img = new Image();
  img.src = src;
  imagesCache[src] = img;

  img.onload = img.onerror = () => {
    loadedImages++;
    checkLoadingComplete();
  };
};

// 모든 이미지 로드 완료 확인
const checkLoadingComplete = () => {
  if (loadedImages === totalImages && isLoading) {
    console.groupCollapsed(
      "[SYSTEM] 로딩된 이미지（ローディングされたイメージ）:"
    );
    Object.values(imagesCache).forEach((img) => console.log(img.src));
    console.groupEnd();

    hideLoadingScreen();
    isLoading = false;
  }
};

// 로딩 화면 숨김
const hideLoadingScreen = () => {
  const loadingScreen = document.getElementById("loadingScreen");
  setTimeout(() => {
    loadingScreen.style.opacity = 0;
    setTimeout(() => {
      loadingScreen.style.display = "none";
      console.log("[SYSTEM] 로딩 화면 숨김 완료.");
      console.log("［SYSTEM］ローディング画面の非表示が完了しました。");
    }, 500);
  }, 500);
};

// 초기화
const initialize = () => {
  initializeResults();
  loadData(currentServer);
  document.addEventListener("dragstart", (event) => {
    if (event.target.tagName === "IMG") event.preventDefault();
  });
};

// 메인 화면 초기화
const initializeResults = () => {
  const resultContainer = document.getElementById("resultContainer");
  resultContainer.innerHTML =
    "<p class='result-message'>「대격전! 끝말잇기 드래곤즈」 도우미<br>『大激戦！しりとりドラゴンズ』ヘルパー<br><br>서버를 선택하세요.<br>サーバーを選択してください。</p>";
  console.log("[SYSTEM] 메인 화면 초기화.");
  console.log("［SYSTEM］メイン画面をリセットしました。");
};

// 서버 선택 버튼 이벤트 리스너
const serverButtons = {
  korea: "./KR_DB.csv",
  japan: "./JP_DB.csv",
};

// 서버 정보 업데이트
const updateServerDisplay = (server) => {
  // 선택된 서버가 한국 서버인지 확인
  const isKoreaServer = server === "./KR_DB.csv";

  // 서버에 맞는 이미지 설정
  document.getElementById("serverImage").src = isKoreaServer
    ? "./KR_srt_top_title.png"
    : "./JP_srt_top_title.png";

  // 제목 업데이트
  const titleText = isKoreaServer
    ? "『대격전! 끝말잇기 드래곤즈』 도우미"
    : "『大激戦！しりとりドラゴンズ』ヘルパー";

  // title 업데이트
  document.title = titleText;

  // 입력 필드의 플레이스홀더 업데이트
  document.getElementById("wordInput").placeholder = isKoreaServer
    ? "단어를 입력하세요."
    : "単語を入力してください。";

  // wordInput 값 초기화
  document.getElementById("wordInput").value = "";

  // 선택한 서버의 데이터 로드 후 결과 업데이트
  loadData(server).then(updateResults);

  // 옵션 체크박스 표시
  document.querySelector(".options-checkbox").style.display = "flex";

  // 진행 내역 불러오기 버튼 표시
  document.querySelector(".options-load").style.display = "flex";

  // 두음법칙(표준) 체크박스 표시 여부 설정
  document.getElementById("applyInitialSoundRule").parentElement.style.display =
    isKoreaServer ? "block" : "none";

  // 히라가나/카타카나 체크박스 표시 여부 설정
  document.getElementById(
    "hiraganaKatakanaCheckbox"
  ).parentElement.style.display = isKoreaServer ? "none" : "block";

  // 서버 옵션 버튼 텍스트 변경
  const loadHistoryButton = document.getElementById("loadHistory");
  const saveHistoryButton = document.getElementById("saveHistory");
  const highlightLabel = document.querySelector(".highlightHistory label");
  const highlightColorLabel = document.getElementById("highlightColorLabel");

  if (isKoreaServer) {
    loadHistoryButton.innerText = "진행 내역 불러오기";
    saveHistoryButton.innerText = "진행 내역 저장하기";
    highlightLabel.innerText = "진행 내역 강조: ";
    highlightColorLabel.innerText = "강조 색: ";
  } else {
    loadHistoryButton.innerText = "進行履歴ロード";
    saveHistoryButton.innerText = "進行履歴セーブ";
    highlightLabel.innerText = "進行履歴強調: ";
    highlightColorLabel.innerText = "強調色: ";
  }

  // 헤더 표시
  document.querySelector(".header").style.display = "block";

  // 선택된 서버 정보 로그
  console.log(`[SYSTEM] ${isKoreaServer ? "한국" : "일본"} 서버 선택.`);
  console.log(
    `［SYSTEM］${isKoreaServer ? "韓国" : "日本"} サーバーを選択しました。`
  );
};

// 한글 초성, 중성, 종성 배열
const initialArray = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];
const medialArray = [
  "ㅏ",
  "ㅐ",
  "ㅑ",
  "ㅒ",
  "ㅓ",
  "ㅔ",
  "ㅕ",
  "ㅖ",
  "ㅗ",
  "ㅘ",
  "ㅙ",
  "ㅚ",
  "ㅛ",
  "ㅜ",
  "ㅝ",
  "ㅞ",
  "ㅟ",
  "ㅠ",
  "ㅡ",
  "ㅢ",
  "ㅣ",
];
const finalArray = [
  "",
  "ㄱ",
  "ㄲ",
  "ㄳ",
  "ㄴ",
  "ㄵ",
  "ㄶ",
  "ㄷ",
  "ㄹ",
  "ㄺ",
  "ㄻ",
  "ㄼ",
  "ㄽ",
  "ㄾ",
  "ㄿ",
  "ㅀ",
  "ㅁ",
  "ㅂ",
  "ㅄ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];

// 한글 글자 초성, 중성, 종성 분리
const splitHangul = (char) => {
  const code = char.charCodeAt(0) - 0xac00;
  const initial = Math.floor(code / (21 * 28));
  const medial = Math.floor((code % (21 * 28)) / 28);
  const final = code % 28;

  return {
    initial: initialArray[initial],
    medial: medialArray[medial],
    final: finalArray[final],
  };
};

// 히라가나, 카타카나 정규화
const normalizeHiraganaKatakana = (word) => {
  return word
    .replace(/[\u30A1-\u30F6]/g, (match) =>
      String.fromCharCode(match.charCodeAt(0) - 0x60)
    )
    .replace(/[\u3041-\u3096]/g, (match) =>
      String.fromCharCode(match.charCodeAt(0) + 0x60)
    );
};

// 결과 테이블 검색 결과 업데이트
const updateResults = () => {
  if (isLoading) return;

  const inputWord = document.getElementById("wordInput").value.trim();
  const resultContainer = document.getElementById("resultContainer");

  /* [TESTONLY]
  // 글자 입력 필드에 아무 글자가 없을 때 결과 테이블에 반환되는 문구
  if (!inputWord) {
    resultContainer.innerHTML =
      currentServer === "./KR_DB.csv"
        ? "<p class='result-message'>단어를 입력하세요.</p>"
        : "<p class='result-message'>単語を入力してください。</p>";
    return;
  }
  */

  const firstChar = inputWord.charAt(0);
  const { initial, medial, final } = splitHangul(firstChar);

  if (currentServer === "./KR_DB.csv") {
    console.log(
      `[SYSTEM] 첫 번째 글자 초성: ${initial}, 중성: ${medial}, 종성: ${final}`
    );
  }

  let variations = [inputWord];

  // 두음법칙(표준) 적용 (한국 서버일 때만)
  // 참고 자료 URL: https://www.goodwriter.or.kr/bbs/board.php?bo_table=s0405&wr_id=25

  // 제5절 두음법칙
  // 제10항 한자음 ‘녀, 뇨, 뉴, 니’가 단어 첫머리에 올 적에는, 두음 법칙에 따라 ‘여, 요, 유, 이’로 적는다.(ㄱ을 취하고, ㄴ을 버림.)
  // 제11항 한자음 ‘랴, 려, 례, 료, 류, 리’가 단어의 첫머리에 올 적에는, 두음 법칙에 따라 ‘야, 여, 예, 요, 유, 이’로 적는다.(ㄱ을 취하고, ㄴ을 버림.)
  // 제12항 한자음 ‘라, 래, 로, 뢰, 루, 르’가 단어의 첫머리에 올 적에는, 두음 법칙에 따라 ‘나, 내, 노, 뇌, 누, 느’로 적는다.(ㄱ을 취하고, ㄴ을 버림.)
  if (
    currentServer === "./KR_DB.csv" &&
    document.getElementById("applyInitialSoundRule").checked
  ) {
    let newInitialSounds = [];
    switch (initial) {
      // 초성이 "ㄴ"일 때
      case "ㄴ":
        // 중성이 ㅕ, ㅛ, ㅠ, ㅣ일 경우 초성을 "ㄴ", "ㅇ"으로 처리
        if (["ㅕ", "ㅛ", "ㅠ", "ㅣ"].includes(medial)) {
          newInitialSounds = ["ㄴ", "ㅇ"];
        }
        break;

      // 초성이 "ㄹ"일 때
      case "ㄹ":
        // 중성이 "ㅑ", "ㅕ", "ㅖ", "ㅛ", "ㅠ", "ㅣ"일 경우 초성을 "ㄹ", "ㅇ"으로 처리
        if (["ㅑ", "ㅕ", "ㅖ", "ㅛ", "ㅠ", "ㅣ"].includes(medial)) {
          newInitialSounds = ["ㄹ", "ㅇ"];
        }
        // 중성이 "ㅏ", "ㅐ", "ㅗ", "ㅚ", "ㅜ", "ㅡ"일 경우 초성을 "ㄹ", "ㄴ"으로 처리
        else if (["ㅏ", "ㅐ", "ㅗ", "ㅚ", "ㅜ", "ㅡ"].includes(medial)) {
          newInitialSounds = ["ㄹ", "ㄴ"];
        }
        break;

      // 초성이 "ㅇ"일 때
      case "ㅇ":
        // 중성이 "ㅑ", "ㅕ", "ㅖ", "ㅛ", "ㅠ", "ㅣ"일 경우 초성을 "ㅇ", "ㄴ", "ㄹ"로 처리
        if (["ㅑ", "ㅕ", "ㅖ", "ㅛ", "ㅠ", "ㅣ"].includes(medial)) {
          newInitialSounds = ["ㅇ", "ㄴ", "ㄹ"];
        }
        break;

      // 위 조건에 해당하지 않는 경우 기존 값 유지
      default:
        newInitialSounds = [initial];
    }

    // 두음법칙(표준) 적용 단어 생성
    variations = newInitialSounds.map((newInitial) => {
      // 새로운 초성을 기반으로 한 새로운 한글 음절을 생성
      return String.fromCharCode(
        0xac00 + // 한글 음절의 시작 코드
          initialArray.indexOf(newInitial) * 21 * 28 + // 새로운 초성의 인덱스를 기반으로 계산
          medialArray.indexOf(medial) * 28 + // 기존 중성의 인덱스를 기반으로 계산
          finalArray.indexOf(final) // 기존 종성의 인덱스를 기반으로 계산
      );
    });

    // 생성된 변형 단어를 콘솔에 출력
    console.log("[SYSTEM] 두음법칙(표준) 검색 대상:", variations);
  }

  const hiraganaKatakanaChecked = document.getElementById(
    "hiraganaKatakanaCheckbox"
  ).checked;

  // 히라가나와 카타카나 구분 없이 처리 (일본 서버일 때만)
  let results;
  if (currentServer === "./JP_DB.csv" && hiraganaKatakanaChecked) {
    results = data.filter((item) => {
      const word = normalizeHiraganaKatakana(item[1]); // 정규화된 단어 사용
      return variations.some((variation) => {
        const normalizedVariation = normalizeHiraganaKatakana(variation);
        return word.startsWith(normalizedVariation);
      });
    });
  } else {
    results = data.filter((item) => {
      const word = item[1]; // 기본 단어 사용
      return variations.some((variation) => word.startsWith(variation));
    });
  }

  // 현재 선택된 서버에 맞는 historyData 배열 선택
  const currentHistoryData =
    currentServer === "./KR_DB.csv"
      ? historyDataKR
      : historyDataJP;

  // 저장된 historyData를 사용하여 결과에 하이라이트 적용
  highlightRows(currentHistoryData); // 강조 표시
  resultContainer.innerHTML =
    results.length === 0
      ? currentServer === "./KR_DB.csv"
        ? "<p class='result-message'>일치하는 검색 결과가 없습니다.</p>"
        : "<p class='result-message'>一致する検索結果がありません。</p>"
      : createResultTable(results);

  // 강조 표시
  highlightRows(currentHistoryData);
};

// 주어진 단어의 마지막 글자를 입력 필드에 추가
function addWordToInput(word) {
  const inputField = document.getElementById("wordInput");
  console.log(`[SYSTEM] 단어（単語）: ${word}`);

  // 단어의 마지막 글자 추출
  const wordLastChar = word.slice(-1);
  let valueToAssign = wordLastChar; // 기본값으로 마지막 글자 할당

  if (currentServer === "./KR_DB.csv") {
    console.log(`[SYSTEM] 한국어 처리: 마지막 글자 "${valueToAssign}" 추가`);
  } else {
    // 작은 일본어 글자 목록 (히라가나, 카타카나 전체)
    const smallJapaneseChars = [
      "ぁ",
      "ぃ",
      "ぅ",
      "ぇ",
      "ぉ",
      "っ",
      "ゃ",
      "ゅ",
      "ょ",
      "ゎ",
      "ァ",
      "ィ",
      "ゥ",
      "ェ",
      "ォ",
      "ッ",
      "ャ",
      "ュ",
      "ョ",
      "ヮ",
    ];

    // 단어의 마지막 글자가 작은 일본어 글자 목록에 포함되는지 확인
    if (smallJapaneseChars.includes(wordLastChar)) {
      valueToAssign = word.slice(-2); // 작은 글자가 포함되면 마지막 두 글자 할당
      console.log(
        `[SYSTEM] 작은 글자 포함: 마지막 두 글자 "${valueToAssign}" 추가`
      );
      console.log(
        `［SYSTEM］小さな文字を含む：最後の2文字「${valueToAssign}」を追加しました。`
      );
    } else if (wordLastChar === "ー") {
      valueToAssign = word.charAt(word.length - 2); // 마지막에서 두 번째 글자 할당
      console.log(
        `[SYSTEM] 마지막 글자가 "ー"(일본어 연장음 기호)이므로 마지막에서 두 번째 글자 "${valueToAssign}" 추가`
      );
      console.log(
        `［SYSTEM］最後の文字が「ー」（日本語延長音記号）なので、最後から二番目の文字「${valueToAssign}」を追加しました。`
      );
    } else {
      console.log(
        `[SYSTEM] 작은 글자 미포함: 마지막 글자 "${valueToAssign}" 추가`
      );
      console.log(
        `［SYSTEM］小さな文字を含まない：最後の文字「${valueToAssign}」を追加しました。`
      );
    }
  }

  inputField.value = valueToAssign; // 최종 값 할당
  inputField.focus(); // 입력란에 포커스
  updateResults(); // 결과 업데이트
}

// 결과 테이블 생성
const createResultTable = (results) => {
  const showOptions = {
    id: document.getElementById("showId").checked,
    word: document.getElementById("showWord").checked,
    image: document.getElementById("showImage").checked,
    description: document.getElementById("showDescription").checked,
    type: document.getElementById("showType").checked,
    csvIndex: true, // CSV Index 열 생성
  };

  let table = `<table><thead><tr>`;

  /* [TESTONLY]
  // CSV Index 열 생성 (숨김 처리)
  if (showOptions.csvIndex)
    table += `<th style="display: none;">CSV Index</th>`;
  */

  // CSV Index 열 생성
  table += `<th>CSV Index</th>`;

  if (showOptions.id) table += `<th>Word ID</th>`;

  if (showOptions.image) table += `<th>Image</th>`;
  if (showOptions.word) table += `<th>Word</th>`;
  if (showOptions.description) table += `<th>Detail Text</th>`;
  table += `<th>Status</th>`; // Status 열 추가
  if (showOptions.type) table += `<th>Type</th>`;

  table += `</tr></thead><tbody>`;

  results.forEach((item) => {
    const imgId =
      currentServer === "./KR_DB.csv" ? item[3] : item[2];
    const wordId =
      currentServer === "./KR_DB.csv" ? item[0] : item[5];
    const description = item[4];
    const word = item[1];
    let imgSrc;

    /* [TESTONLY]
    // imgId 데이터 유형 확인
    console.log(typeof imgId, imgId);
    console.log(`Checking imgId: ${imgId}`);
    console.log(`imgId 10126? ${imgId === 10126}`);
    */

    // 치에루 아이콘 처리
    if (Number(imgId) === 10126) {
      imgSrc =
        currentServer === "./KR_DB.csv"
          ? `./srt_panel_${imgId}.png`
          : "./srt_panel_10126_JP.png";
    } else {
      imgSrc = `./srt_panel_${imgId}.png`;
    }

    const type =
      currentServer === "./KR_DB.csv" ? item[2] : item[0];

    table += `<tr>`;

    /* [TESTONLY]
    // CSV Index 열 값 반환 (숨김 처리)
    if (showOptions.csvIndex) {
      const formattedIndex = (item.row + 1).toString().padStart(3, "0");
      table += `<td class="center" style="display: none;">${formattedIndex}</td>`;
    }
    */

    // CSV Index 열 값 반환
    if (showOptions.csvIndex) {
      const formattedIndex = (item.row + 1).toString().padStart(3, "0");
      table += `<td class="center">${formattedIndex}</td>`;
    }
    if (showOptions.id) table += `<td class="center">${wordId}</td>`;
    if (showOptions.image)
      table += `<td class="center">
      <img src="${imagesCache[imgSrc]?.src || ""}" alt="${word}" data-index="${
        item.row
      }" onclick="addWordToInput('${word}'), addToHistory(${item.row}, 'KR')">
    </td>`;
    if (showOptions.word) table += `<td class="center">${word}</td>`;
    if (showOptions.description) table += `<td>${description}</td>`;

    // Status 열 Add 버튼 클릭 이벤트
    table += `<td class="center">
              <button class="add-btn" data-index="${item.row}" onclick="addToHistory(${item.row}, 'KR')">+</button>
              <button class="remove-btn" data-index="${item.row}" onclick="removeFromHistory(${item.row}, 'KR')">-</button>
              </td>`;

    if (showOptions.type) {
      const typeImageSrc = getTypeImageSrc(type);
      table += `<td class="center">${
        typeImageSrc ? `<img src="${typeImageSrc}" alt="Type Image">` : ""
      }</td>`;
    }

    table += `</tr>`;
  });

  table += `</tbody></table>`;
  return table;
};

// 결과 테이블 Type 열 이미지 반환
const getTypeImageSrc = (type) => {
  if (type === "1") return ""; // 빈 공간
  return currentServer === "./KR_DB.csv"
    ? type === "2"
      ? "./KR_srt_wordlist_label_back.png"
      : type === "3"
      ? "./KR_srt_wordlist_label_princess.png"
      : ""
    : type === "2"
    ? "./JP_srt_wordlist_label_back.png"
    : type === "3"
    ? "./JP_srt_wordlist_label_princess.png"
    : "";
};

// 결과 테이블 Status 열 '+' 버튼 클릭
function addToHistory(index) {
  const formattedIndex = (index + 1).toString().padStart(3, "0");

  if (currentServer === "./KR_DB.csv") {
    if (!historyDataKR.includes(formattedIndex)) {
      historyDataKR.push(formattedIndex);
      highlightRows(historyDataKR);
      console.log("[SYSTEM] (한국 서버) 진행 내역 추가:", historyDataKR);
      console.log("");
    } else {
      console.log(`[SYSTEM] (한국 서버) 이미 추가된 값: ${formattedIndex}`);
      console.log("");
    }
  } else {
    if (!historyDataJP.includes(formattedIndex)) {
      historyDataJP.push(formattedIndex);
      highlightRows(historyDataJP);
      console.log("[SYSTEM] (일본 서버) 진행 내역 추가:", historyDataJP);
      console.log("［SYSTEM］（日本サーバー）進行履歴追加：", historyDataJP);
      console.log("");
    } else {
      console.log(`[SYSTEM] (일본 서버) 이미 추가된 값: ${formattedIndex}`);
      console.log(
        `［SYSTEM］（日本サーバー）既に追加された値：${formattedIndex}`
      );
      console.log("");
    }
  }
}

// 결과 테이블 Status 열 '-' 버튼 클릭
function removeFromHistory(index) {
  const formattedIndex = (index + 1).toString().padStart(3, "0");
  if (currentServer === "./KR_DB.csv") {
    historyDataKR = historyDataKR.filter((item) => item !== formattedIndex);
    highlightRows(historyDataKR);
    console.log("[SYSTEM] (한국 서버) 진행내역 수동 삭제:", historyDataKR);
  } else {
    historyDataJP = historyDataJP.filter((item) => item !== formattedIndex);
    highlightRows(historyDataJP);
    console.log("[SYSTEM] (일본 서버) 진행 내역 수동 삭제:", historyDataJP);
    console.log(
      "［SYSTEM］（日本サーバー）進行内訳の手動削除：",
      historyDataJP
    );
  }
}

// `진행 내역 불러오기` 버튼 기능 (*.txt 파일에서 데이터 파싱)
const parseHistory = (text) => {
  const lines = text.trim().split("\n");
  let capturingKR = false;
  let capturingJP = false;

  const uniqueKR = new Set();
  const uniqueJP = new Set();

  for (const line of lines) {
    if (line.startsWith("KR")) {
      capturingKR = true; // KR 블록 시작
      continue;
    } else if (line.startsWith("JP")) {
      capturingKR = false; // KR 블록 종료
      capturingJP = true; // JP 블록 시작
      continue;
    } else if (capturingKR && line.trim()) {
      uniqueKR.add(line.trim()); // 중복 제거
    } else if (capturingJP && line.trim()) {
      uniqueJP.add(line.trim()); // 중복 제거
    } else if (line.startsWith("JP")) {
      capturingJP = false; // JP 블록 종료
    }
  }

  // 배열에 중복 제거된 값 저장 후 오름차순 정렬
  historyDataKR = Array.from(uniqueKR).sort();
  historyDataJP = Array.from(uniqueJP).sort();
};

// 결과 테이블 강조 행
const highlightRows = (highlightedIndexes) => {
  const resultContainer = document.getElementById("resultContainer");
  const rows = resultContainer.querySelectorAll("tbody tr");

  const isHighlightingEnabled =
    document.getElementById("highlightHistory").checked; // 체크박스 상태 확인
  const highlightColor = document.getElementById("highlightColor").value; // 선택된 색상 가져오기

  rows.forEach((row) => {
    const csvIndexCell = row.querySelector("td:first-child");
    if (
      csvIndexCell &&
      highlightedIndexes.includes(csvIndexCell.textContent.trim()) &&
      isHighlightingEnabled // 강조할지 여부 확인
    ) {
      row.style.backgroundColor = highlightColor; // 선택된 색상으로 강조
    } else {
      row.style.backgroundColor = ""; // 기본 스타일로 복원
    }
  });
};

// 페이지가 로드될 때마다 '--vh' 값 업데이트
window.addEventListener("load", setDynamicVh);

// 서버 선택 버튼
Object.entries(serverButtons).forEach(([key, value]) => {
  document.getElementById(`${key}Server`).addEventListener("click", () => {
    if (!isLoading) {
      currentServer = value;
      updateServerDisplay(value);
    }
  });
});

// 글자 입력 필드
document.getElementById("wordInput").addEventListener("input", (event) => {
  event.target.value = event.target.value.replace(/\s/g, "");
  clearTimeout(timeout);
  timeout = setTimeout(updateResults, 10); // 텍스트 박스에 글자 입력 후 10ms 후 결과 갱신
  console.log("");
  console.log("[SYSTEM] 입력 필드 변경 감지.");
  console.log("［SYSTEM］入力フィールドの変更を検知しました。");
});

// 결과 테이블 머릿글 필터 체크박스
document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
  checkbox.addEventListener("change", updateResults);
  console.log("[SYSTEM] 체크박스 상태 변경 감지.");
  console.log("［SYSTEM］チェックボックスの状態変更を検知しました。");
});

// "진행 내역 불러오기" 버튼 클릭 시 파일 선택 및 처리
document.getElementById("loadHistory").addEventListener("click", () => {
  // 서버에 따라 알림 메시지 설정
  const alertMessage =
    currentServer === "./KR_DB.csv"
      ? "[주의] 모든 진행 내역 설정 값이 초기화되고, 선택한 *.txt 파일의 내용으로 처리됩니다."
      : "［注意］すべての進行履歴の設定値が初期化され、選択した *.txt ファイルの内容で処理されます。";

  // 알림 표시
  alert(alertMessage);

  document.getElementById("fileInput").click();
});

// "진행 내역 불러오기" 버튼 클릭 후 선택 된 파일 처리
document
  .getElementById("fileInput")
  .addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    historyDataKR = []; // 배열 초기화
    historyDataJP = []; // 배열 초기화
    parseHistory(text); // 파일 데이터 저장

    // 배열 내용 로그
    console.log("[SYSTEM] 한국 서버 진행 내역:", historyDataKR);
    console.log("[SYSTEM] 일본 서버 진행 내역:", historyDataJP);
    console.log("［SYSTEM］日本サーバーの進行履歴：", historyDataJP);

    // 강조 표시 및 결과 업데이트
    highlightRows(historyDataKR); // 한국 데이터 하이라이트
    highlightRows(historyDataJP); // 일본 데이터 하이라이트

    // 현재 입력된 단어로 결과 업데이트
    updateResults(); // 강조가 적용된 결과를 다시 업데이트
  });

// 진행 내역 강조 체크박스
document.getElementById("highlightHistory").addEventListener("change", () => {
  updateResults(); // 체크박스 상태 변경 시 결과 업데이트
});

// 진행 내역 강조 색상 선택기
document.getElementById("highlightColor").addEventListener("input", (event) => {
  updateResults(); // 색상 변경 시 결과 업데이트
});

// "진행 내역 저장하기" 버튼 클릭 후 파일 처리
document.getElementById("saveHistory").addEventListener("click", () => {
  // 배열에 저장된 값 오름차순 정렬
  historyDataKR.sort();
  historyDataJP.sort();

  // 파일 내용 생성
  let fileContent = "";
  fileContent += "// [정보] KR: 한국서버, JP: 일본서버\n";
  fileContent += "// ［情報］KR: 韓国サーバー、JP: 日本サーバー\n\n";

  fileContent +=
    "// [정보] 진행 내역은 각 서버에 맞는 문자열(KR 또는 JP)의 사이값을 불러옵니다.\n";
  fileContent +=
    "// ［情報］進行内訳は、各サーバーに合った文字列（KR または JP）の間の値を読み込みます。\n\n";

  fileContent += "// [안내] 제작: https://github.com/IZH318\n";
  fileContent += "// ［案内］制作: https://github.com/IZH318\n\n\n\n";

  fileContent += "// DATA\n";
  fileContent += "KR\n";
  fileContent += historyDataKR.join("\n") + "\n";
  fileContent += "KR\n\n\n\n"; // 빈 줄 추가
  fileContent += "JP\n";
  fileContent += historyDataJP.join("\n") + "\n";
  fileContent += "JP";

  // 현재 날짜와 시간 가져오기
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // 0부터 시작하므로 +1
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const formattedDate = `${year}${month}${day}${hours}${minutes}`; // '202410140257' 형식

  // 파일 저장을 위한 Blob 객체 생성
  const blob = new Blob([fileContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  // 파일 다운로드 링크 생성
  const a = document.createElement("a");
  a.href = url;
  a.download = `PriconneShiritori_${formattedDate}.txt`;
  document.body.appendChild(a);
  a.click();

  // 생성한 링크 제거
  document.body.removeChild(a);
  URL.revokeObjectURL(url); // 메모리 해제
});

// 초기 페이지 로드 시 설정
initialize();
