from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from chatbot import get_chatbot_response

# template_folder와 static_folder를 현재 폴더('.')로 잡고 static_url_path를 비워두면,
# index.html이 같은 폴더에 있는 style.css와 chat.js를 404 없이 바로 호출할 수 있습니다.
app = Flask(__name__, template_folder='.', static_folder='.', static_url_path='')
CORS(app)

# 1. 브라우저에서 http://127.0.0.1:5000/ 접속 시 index.html 페이지를 바로 띄워줍니다.
@app.route("/")
def index():
    return render_template("index.html")

# 2. 챗봇 대화를 처리하는 API 엔드포인트
# ⚠️ 에러 해결 포인트: 자바스크립트가 호출하는 주소와 똑같이 '/chat'으로 변경하고 methods=['POST'] 지정!
@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        
        if not data or "message" not in data:
            return jsonify({"reply": "잘못된 요청입니다. message 필드가 필요합니다."}), 400
            
        user_message = data["message"]
        
        # chatbot.py의 핵심 제미나이 로직 연동
        reply = get_chatbot_response(user_message)
        
        return jsonify({"reply": reply})
        
    except Exception as e:
        # 혹시나 chatbot.py 내부에서 에러(경로 문제, 토큰 문제 등)가 나면 터미널에 에러를 찍어줍니다.
        print(f"Chatbot Error: {e}")
        return jsonify({"reply": "서버 내부에서 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."}), 500

if __name__ == "__main__":
    # 디버그 모드를 켜서 코드가 수정될 때마다 서버가 자동으로 재시작되도록 합니다.
    app.run(host="0.0.0.0", port=5000, debug=True)