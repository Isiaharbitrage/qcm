/* Page admin : création, modification et suppression d'un QCM de 10 questions vrai/faux (accès libre, sans connexion) */

const NB_QUESTIONS = 10;
const TF_LABELS = ["Vrai", "Faux"];

const adminSection = document.getElementById("admin-section");
const quizListEl = document.getElementById("quiz-list");
const formTitle = document.getElementById("form-title");
const questionsContainer = document.getElementById("questions-container");
const quizTitleInput = document.getElementById("quiz-title");
const numeroPreview = document.getElementById("quiz-numero-preview");
const adminAlert = document.getElementById("admin-alert");
const submitBtn = document.getElementById("submit-quiz");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const importJsonInput = document.getElementById("import-json");
const importAlert = document.getElementById("import-alert");
const importBtn = document.getElementById("import-btn");

let nextNumero = 1;
let editingId = null; // id du QCM en cours de modification (null = mode création)

initAdminForm();
loadQuizList();

/* ---------- Helpers ---------- */

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function buildQuestionBlock(index) {
  const wrap = document.createElement("div");
  wrap.className = "question-block";
  wrap.innerHTML = `
    <div class="qb-head"><span>Question ${index + 1}</span></div>
    <div class="field">
      <label>Affirmation à juger vrai ou faux</label>
      <textarea rows="3" class="q-text" data-index="${index}" placeholder="Énoncé de l'affirmation"></textarea>
    </div>
    <div class="tf-choice">
      <label class="tf-option">
        <input type="radio" name="correct-${index}" value="0" class="q-correct" data-index="${index}" />
        <span>Vrai</span>
      </label>
      <label class="tf-option">
        <input type="radio" name="correct-${index}" value="1" class="q-correct" data-index="${index}" />
        <span>Faux</span>
      </label>
    </div>
    <div class="field" style="margin-top:10px; margin-bottom:0;">
      <label>Explication (optionnelle, affichée si la réponse est fausse)</label>
      <textarea rows="2" class="q-explication" data-index="${index}" placeholder="Ex : référence à l'article / interprétation concernée"></textarea>
    </div>
  `;
  return wrap;
}

function initAdminForm() {
  questionsContainer.innerHTML = "";
  for (let i = 0; i < NB_QUESTIONS; i++) {
    questionsContainer.appendChild(buildQuestionBlock(i));
  }
  adminAlert.innerHTML = "";
  quizTitleInput.value = "";
  editingId = null;
  formTitle.innerHTML = `Nouveau <span class="accent">QCM</span>`;
  submitBtn.textContent = "Publier le QCM";
  cancelEditBtn.style.display = "none";
  refreshNumeroPreview();
}

function refreshNumeroPreview() {
  db.collection(COL_QUIZZES)
    .orderBy("numero", "desc")
    .limit(1)
    .get()
    .then((snap) => {
      nextNumero = snap.empty ? 1 : (snap.docs[0].data().numero || 0) + 1;
      if (!editingId) {
        numeroPreview.textContent = `Ce sera le QCM n°${nextNumero}`;
      }
    })
    .catch(() => {
      nextNumero = 1;
      if (!editingId) numeroPreview.textContent = "";
    });
}

/* ---------- Liste des QCM existants ---------- */

function loadQuizList() {
  quizListEl.innerHTML = `<p class="helper-text">Chargement…</p>`;
  db.collection(COL_QUIZZES)
    .orderBy("numero", "asc")
    .get()
    .then((snap) => {
      if (snap.empty) {
        quizListEl.innerHTML = `<p class="helper-text">Aucun QCM publié pour l'instant.</p>`;
        return;
      }
      quizListEl.innerHTML = "";
      snap.forEach((doc) => {
        const q = doc.data();
        const row = document.createElement("div");
        row.className = "quiz-row";
        row.style.cssText =
          "display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.08);";
        row.innerHTML = `
          <div>
            <strong>QCM n°${q.numero}</strong> — ${escapeHtml(q.titre)}
            <div class="helper-text">${(q.questions || []).length} questions</div>
          </div>
          <div class="btn-row" style="margin:0;">
            <button class="btn btn-ghost btn-edit" data-id="${doc.id}">Modifier</button>
            <button class="btn btn-ghost btn-delete" data-id="${doc.id}">Supprimer</button>
          </div>
        `;
        quizListEl.appendChild(row);
      });

      quizListEl.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.addEventListener("click", () => editQuiz(btn.dataset.id));
      });
      quizListEl.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", () => deleteQuiz(btn.dataset.id));
      });
    })
    .catch((err) => {
      console.error(err);
      quizListEl.innerHTML = `<p class="alert alert-error">Erreur lors du chargement : ${escapeHtml(err.message)}</p>`;
    });
}

function editQuiz(id) {
  db.collection(COL_QUIZZES)
    .doc(id)
    .get()
    .then((doc) => {
      if (!doc.exists) return;
      const data = doc.data();

      editingId = id;
      quizTitleInput.value = data.titre || "";
      formTitle.innerHTML = `Modifier le <span class="accent">QCM n°${data.numero}</span>`;
      numeroPreview.textContent = `Modification du QCM n°${data.numero} (le numéro ne change pas)`;
      submitBtn.textContent = "Enregistrer les modifications";
      cancelEditBtn.style.display = "";
      adminAlert.innerHTML = "";

      questionsContainer.innerHTML = "";
      const questions = data.questions || [];
      for (let i = 0; i < NB_QUESTIONS; i++) {
        questionsContainer.appendChild(buildQuestionBlock(i));
        const q = questions[i] || {};
        const textEl = questionsContainer.querySelector(`.q-text[data-index="${i}"]`);
        if (textEl) textEl.value = q.texte || "";
        if (typeof q.bonneReponse === "number") {
          const radio = questionsContainer.querySelector(`.q-correct[data-index="${i}"][value="${q.bonneReponse}"]`);
          if (radio) radio.checked = true;
        }
        const explEl = questionsContainer.querySelector(`.q-explication[data-index="${i}"]`);
        if (explEl) explEl.value = q.explication || "";
      }

      adminSection.scrollIntoView({ behavior: "smooth" });
      quizTitleInput.focus();
    })
    .catch((err) => {
      console.error(err);
      alert("Erreur lors du chargement de ce QCM : " + err.message);
    });
}

function deleteQuiz(id) {
  const ok = confirm(
    "Supprimer définitivement ce QCM ? Il disparaîtra de la page d'accueil. Les résultats déjà enregistrés par les élèves restent conservés dans les stats (ils gardent une copie des questions telles qu'elles étaient au moment du passage)."
  );
  if (!ok) return;

  db.collection(COL_QUIZZES)
    .doc(id)
    .delete()
    .then(() => {
      if (editingId === id) initAdminForm();
      loadQuizList();
    })
    .catch((err) => {
      console.error(err);
      alert("Erreur lors de la suppression : " + err.message);
    });
}

cancelEditBtn.addEventListener("click", () => {
  initAdminForm();
});

/* ---------- Publication / mise à jour (formulaire manuel + import JSON) ---------- */

function publishQuiz(titre, questions, alertEl, btn, forceCreate) {
  const originalLabel = btn.textContent;
  btn.disabled = true;

  const isUpdate = editingId && !forceCreate;

  if (isUpdate) {
    btn.textContent = "Enregistrement…";
    db.collection(COL_QUIZZES)
      .doc(editingId)
      .update({ titre: titre, questions: questions })
      .then(() => {
        alertEl.innerHTML = `<p class="alert alert-success">QCM mis à jour avec succès !</p>`;
        initAdminForm();
        loadQuizList();
      })
      .catch((err) => {
        console.error(err);
        alertEl.innerHTML = `<p class="alert alert-error">Erreur lors de la mise à jour : ${escapeHtml(err.message)}</p>`;
      })
      .finally(() => {
        btn.disabled = false;
        btn.textContent = originalLabel;
      });
    return;
  }

  btn.textContent = "Publication…";
  db.collection(COL_QUIZZES)
    .add({
      titre: titre,
      numero: nextNumero,
      questions: questions,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      alertEl.innerHTML = `<p class="alert alert-success">QCM n°${nextNumero} publié avec succès !</p>`;
      initAdminForm();
      importJsonInput.value = "";
      loadQuizList();
    })
    .catch((err) => {
      console.error(err);
      alertEl.innerHTML = `<p class="alert alert-error">Erreur lors de la publication : ${escapeHtml(err.message)}</p>`;
    })
    .finally(() => {
      btn.disabled = false;
      btn.textContent = originalLabel;
    });
}

/* ---------- Soumission manuelle ---------- */

submitBtn.addEventListener("click", () => {
  adminAlert.innerHTML = "";

  const titre = quizTitleInput.value.trim();
  if (!titre) {
    adminAlert.innerHTML = `<p class="alert alert-error">Ajoute un titre pour ce QCM.</p>`;
    return;
  }

  const questions = [];
  for (let i = 0; i < NB_QUESTIONS; i++) {
    const textEl = questionsContainer.querySelector(`.q-text[data-index="${i}"]`);
    const text = textEl.value.trim();
    if (!text) {
      adminAlert.innerHTML = `<p class="alert alert-error">La question ${i + 1} n'a pas d'énoncé.</p>`;
      textEl.focus();
      return;
    }

    const checkedEl = questionsContainer.querySelector(`.q-correct[data-index="${i}"]:checked`);
    if (!checkedEl) {
      adminAlert.innerHTML = `<p class="alert alert-error">Sélectionne Vrai ou Faux pour la question ${i + 1}.</p>`;
      return;
    }

    const explicationEl = questionsContainer.querySelector(`.q-explication[data-index="${i}"]`);
    const explication = explicationEl ? explicationEl.value.trim() : "";

    const question = {
      texte: text,
      options: TF_LABELS,
      bonneReponse: parseInt(checkedEl.value, 10),
    };
    if (explication) question.explication = explication;

    questions.push(question);
  }

  publishQuiz(titre, questions, adminAlert, submitBtn, false);
});

/* ---------- Import rapide (JSON) — publie toujours un nouveau QCM ---------- */

importBtn.addEventListener("click", () => {
  importAlert.innerHTML = "";

  let data;
  try {
    data = JSON.parse(importJsonInput.value);
  } catch (e) {
    importAlert.innerHTML = `<p class="alert alert-error">JSON invalide : ${escapeHtml(e.message)}</p>`;
    return;
  }

  if (!data.titre || typeof data.titre !== "string") {
    importAlert.innerHTML = `<p class="alert alert-error">Le champ "titre" est manquant ou invalide.</p>`;
    return;
  }

  if (!Array.isArray(data.questions) || data.questions.length !== NB_QUESTIONS) {
    importAlert.innerHTML = `<p class="alert alert-error">Il faut exactement ${NB_QUESTIONS} questions dans le tableau "questions" (${Array.isArray(data.questions) ? data.questions.length : 0} trouvée(s)).</p>`;
    return;
  }

  const questions = [];
  for (let i = 0; i < data.questions.length; i++) {
    const q = data.questions[i] || {};
    if (!q.texte || typeof q.texte !== "string") {
      importAlert.innerHTML = `<p class="alert alert-error">Question ${i + 1} : champ "texte" manquant ou invalide.</p>`;
      return;
    }
    if (typeof q.reponse !== "boolean") {
      importAlert.innerHTML = `<p class="alert alert-error">Question ${i + 1} : champ "reponse" doit être true (Vrai) ou false (Faux).</p>`;
      return;
    }
    const question = {
      texte: q.texte,
      options: TF_LABELS,
      bonneReponse: q.reponse ? 0 : 1,
    };
    if (q.explication && typeof q.explication === "string") {
      question.explication = q.explication;
    }
    questions.push(question);
  }

  publishQuiz(data.titre, questions, importAlert, importBtn, true);
});
