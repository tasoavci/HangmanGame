import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';

const HangmanGame = () => {
    const [word, setWord] = useState('');
    const [category, setCategory] = useState('');
    const [hint, setHint] = useState('');
    const [timer, setTimer] = useState(180);
    const [score, setScore] = useState(0);
    const [guessedLetters, setGuessedLetters] = useState([]);
    const [wrongLetters, setWrongLetters] = useState([]);
    const [playerName, setPlayerName] = useState('');
    const [isGameOver, setIsGameOver] = useState(false);
    const router = useRouter();
    const intervalId = useRef(null);

    const fetchWord = async () => {
        const response = await axios.get('https://www.wordgamedb.com/api/v1/words/random');
        setWord(response.data.word.toUpperCase());
        setCategory(response.data.category);
        setHint(response.data.hint);
    };

    const images = [
        '/hangman0.png',
        '/hangman1.png',
        '/hangman2.png',
        '/hangman3.png',
        '/hangman4.png',
        '/hangman5.png'
    ];

    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        if (storedName) {
            setPlayerName(storedName);
        }

        fetchWord();

        intervalId.current = setInterval(() => {
            setTimer(prevTimer => prevTimer - 1);
        }, 1000);

        return () => clearInterval(intervalId.current); // Bileşen unmount edildiğinde zamanlayıcıyı temizleyin
    }, []);

    useEffect(() => {
        if (timer === 0 || wrongLetters.length >= 5) {
            setIsGameOver(true);
            clearInterval(intervalId.current);
            localStorage.setItem('score', score);
            let swalConfig = {
                title: 'Game over!',
                text: `Your score is: ${score}`,
                showCancelButton: true,
                confirmButtonText: 'Play Again',
                cancelButtonText: 'Go to Home'
            };

            if (wrongLetters.length >= 5) {
                swalConfig = {
                    ...swalConfig,
                    imageUrl: '/hangman5.png',
                    imageHeight: 300
                };
            } else {
                swalConfig = {
                    ...swalConfig,
                    icon: 'warning'
                };
            }

            Swal.fire(swalConfig).then((result) => {
                if (result.isConfirmed) {
                    resetGame();
                } else {
                    router.push('/');
                }
            });
        }
    }, [timer, wrongLetters]);

    useEffect(() => {
        if (isGameOver) {
            return;
        }

        if (word && word.split('').every(letter => guessedLetters.includes(letter))) {
            Swal.fire({
                title: 'Congratulations!',
                text: 'You guessed the word!',
                icon: 'success',
                confirmButtonText: 'Next Word'
            }).then(() => {
                setScore(score + 10);
                resetRound();
            });
        }
    }, [guessedLetters]);

    const resetGame = () => {
        setGuessedLetters([]);
        setWrongLetters([]);
        setScore(0);
        setTimer(180);
        setIsGameOver(false);
        fetchWord();
        intervalId.current = setInterval(() => {
            setTimer(prevTimer => prevTimer - 1);
        }, 1000);
    };

    const resetRound = () => {
        setGuessedLetters([]);
        setWrongLetters([]);
        fetchWord();
    };

    const handleLetterClick = (letter) => {
        if (word.includes(letter)) {
            setGuessedLetters([...guessedLetters, letter]);
        } else {
            setWrongLetters([...wrongLetters, letter]);
        }
    };

    const renderWord = () => {
        return word.split('').map((letter, index) => (
            <span key={index} className="border-b-2 border-gray-500 mx-1 text-2xl">
                {guessedLetters.includes(letter) ? letter : '_'}
            </span>
        ));
    };

    const renderKeyboard = () => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        return alphabet.map((letter) => (
            <button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                className={`m-1 p-2 w-10 h-10 ${guessedLetters.includes(letter) || wrongLetters.includes(letter) ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'} rounded`}
                disabled={guessedLetters.includes(letter) || wrongLetters.includes(letter)}
            >
                {letter}
            </button>
        ));
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-800 select-none">
            <div className="bg-white p-8 rounded shadow-md text-center">
                <h1 className="text-4xl font-bold mb-10">Hangman Game</h1>
                <div className='flex md:flex-row flex-col  items-center justify-center md:gap-32 gap-20 mb-10'>
                    <div>
                        <img className='w-[300px] h-[300px] object-contain' src={images[wrongLetters.length]} alt={images[wrongLetters.length]} />
                    </div>
                    <div className='bg-gray-300 p-12 rounded'>
                        <p className="mb-2"><strong>Category:</strong> {category}</p>
                        <p className="mb-2"><strong>Hint:</strong> {hint}</p>
                        <p className="mb-5"><strong>Timer:</strong> {timer}s</p>
                        <p className="mb-2"><strong>Player:</strong> {playerName}</p>
                        <p className="mb-4"><strong>Score:</strong> {score}</p>
                    </div>
                </div>
                <div className="mb-4">
                    {renderWord()}
                </div>
                <div className="flex flex-wrap justify-center">
                    {renderKeyboard()}
                </div>
                <p className="mt-4"><strong>Wrong Guesses:</strong> {wrongLetters.join(', ')}</p>
            </div>
        </div>
    );
};

export default HangmanGame;
