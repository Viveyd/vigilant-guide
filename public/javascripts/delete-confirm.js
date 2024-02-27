const deleteTrigger = document.querySelector("#delete-trigger");
const deleteConfirmer = document.querySelector("#delete-confirmer");

deleteTrigger.addEventListener("click", (e) => {
  e.preventDefault();
  deleteTrigger.style.display = "none";
  deleteConfirmer.style.display = "inline-block";
});
