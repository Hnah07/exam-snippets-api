document.addEventListener("DOMContentLoaded", function () {
  const languageFilter = document.getElementById("languageFilter");
  const tagFilter = document.getElementById("tagFilter");
  const snippetRows = document.querySelectorAll(".snippet-row");

  hljs.highlightAll();

  new ClipboardJS(".copy-button").on("success", function (e) {
    const button = e.trigger;
    const originalText = button.textContent;
    button.textContent = "Copied!";
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  });

  function filterSnippets() {
    const selectedLanguage = languageFilter.value.toLowerCase();
    const selectedTag = tagFilter.value.toLowerCase();

    snippetRows.forEach((row) => {
      const rowLanguage = row.getAttribute("data-language").toLowerCase();
      const rowTags = row.getAttribute("data-tags").toLowerCase().split(",");

      const languageMatch =
        !selectedLanguage || rowLanguage === selectedLanguage;
      const tagMatch = !selectedTag || rowTags.includes(selectedTag);

      if (languageMatch && tagMatch) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  }

  languageFilter.addEventListener("change", filterSnippets);
  tagFilter.addEventListener("change", filterSnippets);
});
