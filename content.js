function parseConversationTurns(presentation) {
    // search for entities like these data-testid="conversation-turn-5"
    const selector = '[data-testid^="conversation-turn-"]';
    const elements = presentation.querySelectorAll(selector);
    if (elements.length === 0) {
        console.log('No conversation turns found');
        return;
    }
    console.log('Conversation turns found');
    console.log(elements);
    //TODO: parse conversation turns roles
    // <div data-message-author-role="user"  
    return Array.from(elements).map(element => element.textContent);
}

function searchForPresentationsAndSave() {
    // search for presentations div[role="presentation"]
    // if found, add a button to the page that says "Save Conversation Turns"
    // when clicked, save the conversation turns to a file
    // if not found, do nothing
    const selector = 'div[role="presentation"]';
    const presentations = document.querySelectorAll(selector);
    if (presentations.length === 0 && window.location.href.includes('openai.')) {
        console.log('No presentations found');
        return;
    }
    console.log('Presentations found');

    // If there is a button already under div#role="presentation", remove it
    presentations.forEach(presentation => {
        /*const selector2 = 'button#save-conversation-turns-button';
        const button = presentation.querySelector(selector2);
        if (button !== null) {
            button.remove();
        }

        // Add a button to the page that says "Save Conversation Turns"
        const buttonElement = document.createElement('button');
        buttonElement.id = 'save-conversation-turns-button';
        buttonElement.type = 'button';
        const spanElement = document.createElement('span');
        spanElement.textContent = 'Save Conversation Turns';
        buttonElement.appendChild(spanElement);
        presentation.appendChild(buttonElement);*/

        // Add a click handler for the button element
        /*buttonElement.addEventListener('click', () => {
            console.log('Save conversation turns button clicked');
            // parse diff-text
            const texts = parseConversationTurns(presentation);
            console.log('Conversation turns:', texts);
            saveConversationTurns(texts);
        });*/

        const texts = parseConversationTurns(presentation);
        if (texts !== undefined) {
            console.log('Conversation turns:', texts);
            saveConversationTurns(texts);
        }
    });
}

function saveConversationTurns(texts) {
    // Save instructions to a file
    const url = window.location.href;
    const urlParts = url.split('/');
    const conversationId = urlParts[urlParts.length - 1];
    const filename = `conversations_${conversationId}.json`;
    const file = new File([JSON.stringify(texts, '\n')], filename, {type: 'text/json'});
    const file_url = URL.createObjectURL(file);
    console.log('Saving conversations to file:', filename);
    chrome.runtime.sendMessage({action: "saveFile", filename: filename, file: file, file_url: file_url}, function(response) {
        console.log(response);
    });
}

function saveInstructions(instructions) {
    // Save instructions to a file
    const filename = instructions.id.replace(':') + '.json';
    const file = new File([JSON.stringify(instructions, '\n')], filename, {type: 'text/json'});
    const file_url = URL.createObjectURL(file);
    console.log('Saving instructions to file:', file_url);
    chrome.runtime.sendMessage({action: "saveFile", filename: filename, file: file, file_url: file_url}, function(response) {
        console.log(response);
    });
}

function searchForInstructions() {
    // look for textare with placeholder "What does this GPT do? How does it behave? What should it avoid doing?"
    // if found, add a button to the page that says "Save Instructions"
    // when clicked, save the instructions to a file
    // if not found, do nothing
    const instructions_selector = 'textarea[placeholder="What does this GPT do? How does it behave? What should it avoid doing?"]';
    const instructions = document.querySelector(instructions_selector);
    if (instructions === null) {
        console.log('No instructions found');
        return;
    }
    console.log('Instructions found');
    console.log(instructions);

    const title_selector = 'input[placeholder="Name your GPT"]';
    const title = document.querySelector(title_selector);
    
    const description_selector = 'input[placeholder="Add a short description about what this GPT does"]';
    const description = document.querySelector(description_selector);

    const result = {
        id: title.value.replace(/[^a-z0-9-_]/gi, '_').replace(/ /g, '_'),
        title: title.value,
        description: description.value,
        instructions: instructions.value,
        url: window.location.href,
    };

    console.log('Instructions:', result);
    return result;
}

function addListenerToInstructions(instructions) {
    // If there is a listener already, remove it
    if (instructions.hasListener) {
        instructions.removeEventListener('change', instructions.listener);
    }

    // Add listener for conversation saving    
    instructions.addEventListener('change', () => {
        console.log('Instructions changed');
        console.log(instructions.value);
        saveInstructions(instructions.value);
    });
}

function searchForInstructionsAndSave() {
   let instructions = searchForInstructions();
    if (instructions === undefined) {
        return;
    }

    // TODO: make sure this is not unexpected for user
    //addListenerToInstructions(instructions);

    saveInstructions(instructions);
}

searchForInstructionsAndSave();
searchForPresentationsAndSave();