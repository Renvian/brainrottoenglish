// Sample Brainrot Phrases
const samples = [
    "bro that skibidi toilet video was lowkey fire no cap, the sigma grindset is real fr fr",
    "gyatt that ohio rizz party was bussin ong, we were vibing and taking Ls all night",
    "this mewing tutorial hit different, got that fanum tax energy ngl",
    "im deadass the main character rn, slay queen energy only, mid takes are not allowed",
    "the alpha male just got ratio'd by a beta, W for the underdogs fr"
];

// DOM Elements
const inputText = document.getElementById('inputText');
const randomBtn = document.getElementById('randomBtn');
const charCount = document.getElementById('charCount');
const translateBtn = document.getElementById('translateBtn');
const translateBtnIcon = translateBtn.querySelector('.icon');
const translateBtnText = translateBtn.querySelector('.btn-text');
const errorMsg = document.getElementById('errorMsg');
const outputText = document.getElementById('outputText');
const copyBtn = document.getElementById('copyBtn');
const copyBtnIcon = copyBtn.querySelector('.icon');
const copyBtnText = copyBtn.querySelector('.btn-text');

// Random Example Handler
randomBtn.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * samples.length);
    inputText.value = samples[randomIndex];
    updateCharCount();
});

// Character Counter
const updateCharCount = () => {
    charCount.textContent = `${inputText.value.length} / 1000`;
};
inputText.addEventListener('input', updateCharCount);

// Translate Logic
translateBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    if (!text) {
        showError("Please enter some brainrot vernacular first.");
        return;
    }

    // Set Loading State
    translateBtn.disabled = true;
    if (translateBtnIcon) {
        translateBtnIcon.dataset.lucide = 'sparkles';
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }
    if (translateBtnText) {
        translateBtnText.textContent = "Formalizing...";
    }
    errorMsg.classList.add('hidden');
    outputText.textContent = "Please wait, the distinguished professor is writing...";
    outputText.classList.remove('has-content');
    copyBtn.classList.add('hidden');

    try {
        // Send request to our secure Vercel backend
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "A most unfortunate error occurred.");
        }

        // Display Success
        outputText.textContent = data.translation;
        outputText.classList.add('has-content');
        copyBtn.classList.remove('hidden');

    } catch (err) {
        showError(err.message);
        outputText.textContent = "Translation failed.";
        outputText.classList.remove('has-content');
    } finally {
        // Reset Loading State
        translateBtn.disabled = false;
        if (translateBtnIcon) {
            translateBtnIcon.dataset.lucide = 'arrow-down';
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons();
            }
        }
        if (translateBtnText) {
            translateBtnText.textContent = "Make it Distinguished";
        }
    }
});

// Copy to Clipboard
copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(outputText.textContent);
        const original = copyBtnText ? copyBtnText.textContent : copyBtn.textContent;
        if (copyBtnIcon) {
            copyBtnIcon.dataset.lucide = 'check';
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons();
            }
        }
        if (copyBtnText) {
            copyBtnText.textContent = "Copied!";
        }
        setTimeout(() => {
            if (copyBtnIcon) {
                copyBtnIcon.dataset.lucide = 'copy';
                if (typeof lucide !== 'undefined' && lucide.createIcons) {
                    lucide.createIcons();
                }
            }
            if (copyBtnText) {
                copyBtnText.textContent = original;
            }
        }, 2000);
    } catch (err) {
        showError("Failed to copy text.");
    }
});

// Helper for Error Messages
function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
}

// Initialize lucide icons when available
if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
}
