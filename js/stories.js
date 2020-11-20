// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  let starType;

  if (!(currentUser)) {
    starType = "far";
    console.log('no current user');
  } else {
    console.log('current user')
    starType = (currentUser.checkIfInFavorites(story)) ? "fas" : "far";
  }

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <span class="star">
        <i class="${starType} fa-star"></i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/* Gets list of current user favorites, generates HTML, and puts on page */
// REFACTOR NOTE: could we combine the two below functions?

function putFavoritesOnPage() {
  console.debug("");

  $favoriteStoriesList.empty();

  for (let fav of currentUser.favorites) {
    const $fav = generateStoryMarkup(fav)
    $favoriteStoriesList.append($fav);
  }
  $favoriteStoriesList.show();
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** 
 * handles submission of submit form. 
 * Gets all the data from the form, calls addStory on StoryList 
 * Receives the Story instance back 
 * Puts new story in DOM. 
 * */
async function storySubmitAndDisplay(evt) {
  console.debug("storyFromSubmitAndDisplay");

  evt.preventDefault();

  const author = $('#create-author').val();
  const title = $('#create-title').val();
  const url = $('#create-url').val();

  const newStory = {
    author,
    title,
    url
  };

  const story = await storyList.addStory(currentUser, newStory);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $submitForm.trigger("reset");
  $submitForm.slideUp("slow");
}

$submitForm.on('submit', storySubmitAndDisplay);

/* 
* handles click of star next to story. When clicked, star will  change
and story will be added to currentUser's favorites.  */

function favoriteStoryAfterClick(evt) {
  const star = $(evt.target);
  star.toggleClass('far fas');

  const storyID = star.closest('li').attr('id');

  let story = storyList.findStoryInstance(storyID);
  if (currentUser.checkIfInFavorites(story)) {
    currentUser.removeStoryFromFavorites(storyID);
  } else {
    currentUser.addStoryToFavorites(storyID);
  }
}

$allStoriesList.on('click', '.star', favoriteStoryAfterClick)