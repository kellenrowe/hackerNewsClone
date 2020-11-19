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

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
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
function storyFromSubmitAndDisplay(evt) {
  console.debug("storyFromSubmitAndDisplay");
  
  evt.preventDefault();

  const author = $('#author-name').val();
  const title = $('#title-name').val();
  const url = $('#url-name').val();

  const newStory = {
    author,
    title,
    url
  };

  const newStoryIns = storyList.addStory(currentUser, newStory);

  putStoriesOnPage();
  $submitForm.trigger("reset");
}

$('#submit-btn').on('submit', storyFromSubmitAndDisplay);