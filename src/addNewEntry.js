// addNewEntry.js
// Simple function file - just like C++ header/source files

export function addNewEntry(date, text, media = []) {
  // Create new entry object
  const newEntry = {
    date: date,
    text: text,
    media: media,
  };

  // Add to beginning of entries array (from main file)
  entries.unshift(newEntry);

  // Update the UI (using functions from main file)
  generateEntryList();
  loadEntry(0); // Auto-select the new entry

  console.log(`✅ New entry added for ${date}`);
}
