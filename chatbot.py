import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

# .env 파일 읽기
load_dotenv()

# 환경변수에서 API 키 가져오기
API_KEY = os.getenv("GEMINI_API_KEY")

# Gemini Client 생성
client = genai.Client(api_key=API_KEY)


def get_chatbot_response(user_message):
    data_dir = "./data"
    context_data = ""

    # data 폴더 내의 모든 txt 파일 읽기
    if os.path.exists(data_dir):
        for filename in os.listdir(data_dir):
            if filename.endswith(".txt"):
                file_path = os.path.join(data_dir, filename)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        context_data += f.read() + "\n\n"
                except Exception as file_err:
                    print(f"⚠️ 파일 읽기 실패 ({filename}): {file_err}")

    print(f"\n[INFO] 학사 데이터 로딩 완료: 총 {len(context_data)} 글자 파싱됨.")

    system_instruction = f"""
    당신은 대학교의 학사안내 및 학과 정보 안내 전문 챗봇입니다.

    아래 제공되는 [학교 학과 정보 데이터]를 완벽하게 숙지하고,
    사용자의 질문에 친절하고 정확하게 답하세요.

    데이터에 명시되어 있지 않은 과목, 학점, 교수 이름이나 정보에 대해서는
    무작정 지어내지 말고

    "죄송합니다. 해당 학과 정보나 교수님 정보는 현재 등록되어 있지 않습니다."

    라고 정중하게 답하세요.

    [학교 학과 정보 데이터]
    {context_data}
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.3,
            ),
        )

        return response.text

    except Exception as e:
        print(f"\n❌ Gemini API 오류: {e}")
        return f"죄송합니다. 현재 AI 호출에 실패했습니다.\n\n오류: {e}"