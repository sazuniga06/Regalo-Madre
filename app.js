        window.onload = function() {
            // --- DATOS DE LA CANCIÓN ---
            const songData = {
                title: "Mi Todo - Feliz Cumpeaños Mamá",
                artist: "CodeZM",
                cover: "cover/Mi Todo.png",
                src: "cancion/Mi Todo.mp3",
                subtitles: "Subtitles/mi-todo.vtt" // Cambiado a .vtt
            };

            // Obtener elementos del DOM
            const giftElement = document.getElementById('gift');
            const musicCardElement = document.getElementById('musicCard');
            const playButton = document.getElementById('playButton');
            const playIcon = document.getElementById('playIcon');
            const pauseIcon = document.getElementById('pauseIcon');
            const buttonText = document.getElementById('buttonText');
            const confettiContainer = document.getElementById('confetti-container');
            const clickTextElement = document.querySelector('.click-text');
            const audioElement = document.getElementById('audioElement');
            const musicCover = document.getElementById('musicCover');
            const musicTitle = document.getElementById('musicTitle');
            const musicArtist = document.getElementById('musicArtist');
            const subtitleContainer = document.getElementById('subtitle-container');
            const subtitleColumn = document.getElementById('subtitle-column');
            const playerCardContent = document.getElementById('player-card-content');

            let isPlaying = false;
            let subtitles = [];
            let layoutRevealed = false;

            // --- LÓGICA DE SUBTÍTULOS VTT ---

            function vttTimeToSeconds(time) {
                const parts = time.split(':');
                let hours = 0, minutes = 0, seconds = 0;
                if (parts.length === 3) {
                    hours = parseInt(parts[0], 10);
                    minutes = parseInt(parts[1], 10);
                    seconds = parseFloat(parts[2].replace(',', '.'));
                } else if (parts.length === 2) {
                    minutes = parseInt(parts[0], 10);
                    seconds = parseFloat(parts[1].replace(',', '.'));
                } else { return 0; }
                if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) { return 0; }
                return (hours * 3600) + (minutes * 60) + seconds;
            }

            function parseVtt(vttText) {
                const normalizedText = vttText.trim().replace(/\r\n?/g, '\n');
                const blocks = normalizedText.split('\n\n');
                return blocks.map(block => {
                    const lines = block.split('\n');
                    if (lines[0].includes('WEBVTT') || lines.length < 2) { return null; }
                    const timeLineIndex = lines.findIndex(line => line.includes(' --> '));
                    if (timeLineIndex === -1) { return null; }
                    const timeMatch = lines[timeLineIndex].split(' --> ');
                    if (timeMatch.length !== 2) { return null; }
                    const textLines = lines.slice(timeLineIndex + 1);
                    if (textLines.length === 0 || textLines[0].trim() === '') { return null; }
                    return {
                        startTime: vttTimeToSeconds(timeMatch[0].trim()),
                        endTime: vttTimeToSeconds(timeMatch[1].trim()),
                        text: textLines.join('<br>')
                    };
                }).filter(Boolean);
            }
            
            function loadSubtitles(url) {
                fetch(url).then(response => {
                    if (!response.ok) { throw new Error(`Error HTTP: ${response.status}`); }
                    return response.text();
                }).then(text => {
                    subtitles = parseVtt(text);
                }).catch(error => {
                    console.error('Error al cargar los subtítulos:', error);
                    subtitleContainer.textContent = "Subtítulos no disponibles.";
                });
            }
            
            let currentSubtitleText = '';

            function updateSubtitle() {
                const currentTime = audioElement.currentTime;
                const currentSubtitle = subtitles.find(sub => currentTime >= sub.startTime && currentTime <= sub.endTime);
                const newText = currentSubtitle ? currentSubtitle.text : '';
                if (newText !== currentSubtitleText) {
                    subtitleContainer.style.opacity = 0;
                    setTimeout(() => {
                        subtitleContainer.innerHTML = newText;
                        currentSubtitleText = newText;
                        if (newText) { subtitleContainer.style.opacity = 1; }
                    }, 250);
                }
            }

            // --- LÓGICA PRINCIPAL ---

            function loadSong(song) {
                musicTitle.textContent = song.title;
                musicArtist.textContent = song.artist;
                musicCover.src = song.cover;
                audioElement.src = song.src;
                if (song.subtitles) { loadSubtitles(song.subtitles); }
            }
            
            loadSong(songData);

            function createConfetti() {
                const confettiCount = 100;
                const colors = ['#e13a9d', '#f7b32b', '#8ecae6', '#ffffff', '#f8cdda'];
                for (let i = 0; i < confettiCount; i++) {
                    const confetti = document.createElement('div');
                    confetti.classList.add('confetti');
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    const startX = Math.random() * 100 + '%';
                    const animationDuration = (Math.random() * 2) + 1.5 + 's';
                    const animationDelay = Math.random() * 0.5 + 's';
                    confetti.style.backgroundColor = randomColor;
                    confetti.style.left = `calc(${startX} - 5px)`;
                    confetti.style.top = '-10px';
                    confetti.style.animationDuration = animationDuration;
                    confetti.style.animationDelay = animationDelay;
                    if (Math.random() > 0.5) {
                        confetti.style.width = '15px';
                        confetti.style.height = '8px';
                        confetti.style.borderRadius = '2px';
                    }
                    confettiContainer.appendChild(confetti);
                    setTimeout(() => confetti.remove(), 4000);
                }
            }

            giftElement.addEventListener('click', () => {
                if (giftElement.classList.contains('open')) return;
                clickTextElement.style.opacity = '0';
                createConfetti();
                giftElement.classList.add('open');
                setTimeout(() => {
                    musicCardElement.classList.add('visible');
                }, 800);
            });

            playButton.addEventListener('click', () => {
                if (!isPlaying) {
                    if (!layoutRevealed) {
                        // Aplica las clases para expandir
                        playerCardContent.style.width = '640px'; // Para pantallas grandes
                        subtitleColumn.classList.remove('h-0', 'md:w-0', 'opacity-0');
                        // Para pantallas pequeñas, la altura se ajustará por el contenido
                        layoutRevealed = true;
                    }
                    isPlaying = true;
                    playIcon.classList.add('hidden');
                    pauseIcon.classList.remove('hidden');
                    buttonText.textContent = 'Pausar';
                    audioElement.play();
                } else {
                    isPlaying = false;
                    playIcon.classList.remove('hidden');
                    pauseIcon.classList.add('hidden');
                    buttonText.textContent = 'Reproducir';
                    audioElement.pause();
                }
            });

            audioElement.addEventListener('ended', () => {
                isPlaying = false;
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
                buttonText.textContent = 'Reproducir';
            });
            
            audioElement.addEventListener('timeupdate', updateSubtitle);
        };