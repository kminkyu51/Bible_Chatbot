// DOM(HTML)이 완전히 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    const inputElement = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // 1. 전송 버튼 클릭 이벤트 등록
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    // 2. 엔터키 입력 이벤트 등록
    if (inputElement) {
        inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});

// 메시지 전송 및 생각 중 로딩 처리 함수
async function sendMessage() {
    const inputElement = document.getElementById('user-input');
    const chatWindow = document.getElementById('chat-window');

    if (!inputElement || !chatWindow) return;

    const userMessage = inputElement.value.trim();
    if (!userMessage) return; // 빈 메시지 방지

    // 1. 사용자 메시지 말풍선 출력
    appendMessage('user', userMessage);
    inputElement.value = '';

    // 2. "🤖 생각 중..." 로딩 메시지 출력
    const loadingMessageElement = appendMessage('bot', '🤖 생각 중...');
    loadingMessageElement.classList.add('loading-text');

    try {
        // 3. 백엔드 서버 통신 (Flask /chat 엔드포인트)
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage }),
        });

        const data = await response.json();

        // 4. "생각 중..." 문구를 실제 제미나이 답변으로 교체
        if (response.ok && data.reply) {
            loadingMessageElement.innerText = data.reply;
        } else {
            loadingMessageElement.innerText = '⚠️ 오류가 발생했습니다. 다시 시도해 주세요.';
        }
    } catch (error) {
        console.error('Error:', error);
        loadingMessageElement.innerText = '❌ 서버와 연결할 수 없습니다.';
    } finally {
        loadingMessageElement.classList.remove('loading-text');
        chatWindow.scrollTop = chatWindow.scrollHeight; // 자동 스크롤 하단 이동
    }
}

// 화면에 메시지 말풍선을 추가해 주는 함수
function appendMessage(sender, text) {
    const chatWindow = document.getElementById('chat-window');
    
    // 외부 감싸는 div 생성 (message, bot-message / user-message)
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message', `${sender}-message`);

    // 내부 span 생성 (message-content)
    const messageContent = document.createElement('span');
    messageContent.classList.add('message-content');
    messageContent.innerText = text;

    messageContainer.appendChild(messageContent);
    chatWindow.appendChild(messageContainer);
    
    chatWindow.scrollTop = chatWindow.scrollHeight;

    return messageContent; // 로딩 문구 교체를 위해 innerText 대상인 span 반환
}