document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // 화면에 메시지(말풍선)를 추가하는 함수
    function appendMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);

        const contentSpan = document.createElement('span');
        contentSpan.classList.add('message-content');
        contentSpan.innerText = message;

        messageDiv.appendChild(contentSpan);
        chatWindow.appendChild(messageDiv);

        // 새 메시지가 오면 스크롤을 가장 아래로 자동 이동
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // 서버(/chat)로 메시지를 전송하고 답변을 받는 비동기 함수
    async function sendMessageToServer(userMessage) {
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) {
                appendMessage('bot', '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
                return;
            }

            const data = await response.json();
            
            // 🟢 [수정 포인트] 파이썬 백엔드(app.py)가 주는 'reply' key와 이름을 똑같이 맞춰줍니다!
            if (data && data.reply) {
                appendMessage('bot', data.reply);
            } else {
                appendMessage('bot', '답변을 받아오지 못했습니다.');
            }

        } catch (error) {
            console.error('통신 에러:', error);
            appendMessage('bot', '서버와 연결할 수 없습니다. Flask 서버가 켜져 있는지 확인하세요.');
        }
    }

    // 전송 처리 로직
    function handleUserSend() {
        const message = userInput.value.trim();
        if (message === "") return; // 빈 칸이면 전송 안 함

        console.log('전송 시도된 메시지:', message); // 디버깅용 확인 로그
        appendMessage('user', message);
        userInput.value = ''; // 입력창 비우기
        sendMessageToServer(message);
    }

    // 전송 버튼 마우스 클릭 시
    if (sendButton) {
        sendButton.addEventListener('click', () => {
            handleUserSend();
        });
    }

    // 한글 입력(IME) 충돌 방지 완벽 적용 엔터키 이벤트!
    if (userInput) {
        userInput.addEventListener('keydown', (event) => {
            // event.isComposing 은 한글 조합 중일 때 엔터키가 두 번 먹히거나 씹히는 걸 방지해 줌!
            if (event.key === 'Enter' && !event.isComposing) {
                event.preventDefault(); // 기본 줄바꿈 방지
                handleUserSend();
            }
        });
    }
});