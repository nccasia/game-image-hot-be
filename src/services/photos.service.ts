import { Logger } from '../logger/winston-logger.config';
import Photos, { IPhoto } from '../models/Photos';
import PhotoEloHistory from '../models/PhotoEloHistory';
import QuestionPhotoHistory, { IQuestionPhotoHistory } from '../models/QuestionPhotoHistory';
import { app_constant, PHOTO_CATEGORY } from '../config/constant';

// elo rating formula in chess
function probability(leftRating: number, rightRating: number){
  return 1.0*1.0/(1+1.0*Math.pow(10, 1.0*(leftRating-rightRating)/400));
}

function eloRating(leftRating: number, rightRating: number, ratingFactor: number, win: boolean) {
  let leftProb = probability(rightRating, leftRating); // left win probability
  let rightProb = probability(leftRating, rightRating); // right win probability
  if (win) { // left wins, right chosen
    leftRating = Math.round(leftRating + ratingFactor * (1 - leftProb)); // add left rating
    rightRating = Math.round(rightRating + ratingFactor * (0 - rightProb)); // minus right rating
  } else { // right wins. left chosen
    leftRating = Math.round(leftRating + ratingFactor * (0 - leftProb)); // minus left rating
    rightRating = Math.round(rightRating + ratingFactor * (1 - rightProb)); // add  right rating
  }
  return { leftRating, rightRating };
}

export async function updateRating(leftPhotoId: string, rightPhotoId: string, leftWin: boolean) {
  let resultRating: any;
  const leftPhoto = await Photos.findOne({ photo_id: leftPhotoId });
  const rightPhoto = await Photos.findOne({ photo_id: rightPhotoId });

  if (!leftPhoto || !rightPhoto) {
    throw new Error('One or both photo(s) not found');
  }

  const leftRating = leftPhoto.score;
  const rightRating = rightPhoto.score;

  resultRating = eloRating(
    leftRating,
    rightRating,
    app_constant.gameParameter.rating_factor,
    leftWin
  );

  leftPhoto.score = Math.round(resultRating.leftRating);
  rightPhoto.score = Math.round(resultRating.rightRating);

  try {
    await Photos.bulkWrite([
      {
        updateOne: {
          filter: { photo_id: leftPhotoId },
          update: { $set: { score: resultRating.leftRating } },
        },
      },
      {
        updateOne: {
          filter: { photo_id: rightPhotoId },
          update: { $set: { score: resultRating.rightRating } },
        },
      },
    ]);

    await PhotoEloHistory.insertMany([
    {
      photo_id: leftPhotoId,
      score_before: leftPhoto.score,
      score_after: leftRating,
      match_result: leftWin ? "win" : "lose",
    },
    {
      photo_id: rightPhotoId,
      score_before: rightPhoto.score,
      score_after: rightRating,
      match_result: leftWin ? "lose" : "win",
    },
  ]);

    Logger.info(`Updated ratings with bulkWrite: left=${leftRating}, right=${rightRating}`);
  } catch (err) {
    Logger.error("Bulk update failed:", err);
  }
  return resultRating;
}

async function insertHistories(data: any[]): Promise<any> {
  const docs = data.map(item => {
    const leftScoreBefore = item.leftPhoto.score;
    const rightScoreBefore = item.rightPhoto.score;

    return {
      left_photo_id: item.leftPhoto.photo_id,
      left_score_before: leftScoreBefore,

      right_photo_id: item.rightPhoto.photo_id,
      right_score_before: rightScoreBefore,

      match_result_before: item.leftWin ? "win" : "lose",

      changed_at: new Date(),
    };
  });

  let result = await QuestionPhotoHistory.insertMany(docs);
  return result;
}

export async function GetRandomQuestion(): Promise<any> {
  let result: any = [];
  let randomPhotoIds: string[] = []
  for(let i = 0; i < app_constant.gameParameter.random_question_amount; i++) {
    const categories = Object.values(PHOTO_CATEGORY);
    const randomIndex = Math.floor(Math.random() * categories.length);

    const listPhotoIds = app_constant.photos
      .filter((element: any) => element.category === categories[randomIndex])
      .map((element: any) => element.photo_id);

    if (listPhotoIds.length < 2) {
      throw new Error("Not enough photos in this category");
    }

    const randomIds: string[] = [];
    while (randomIds.length < 2) {
      const randomIndex2 = Math.floor(Math.random() * listPhotoIds.length);
      const candidate = listPhotoIds[randomIndex2];
      if (!randomIds.includes(candidate) && !randomPhotoIds.includes(candidate)) {
        randomIds.push(candidate);
        randomPhotoIds.push(candidate);
      }
    }

    const photoDetails = await Photos.find({ photo_id: { $in: randomIds } });
    let resultElement: any = {};
    let leftWin: boolean = false;
    if(photoDetails[0].score == photoDetails[1].score) {
      const randomIndex3 = Math.floor(Math.random() * randomIds.length);
      leftWin = randomIndex3 == 0 ? true : false;
    }
    else {
      leftWin = photoDetails[0].score > photoDetails[1].score ? true: false;
    }

    resultElement.leftPhoto = photoDetails[0].getInfo();
    resultElement.rightPhoto = photoDetails[1].getInfo();
    resultElement.leftWin = leftWin;

    result.push(resultElement);
  }
  let questionPhotoHistories = await insertHistories(result);
  result = result.map((element: any, index: number) => {
    const history = questionPhotoHistories[index];
    return {
      ...element,
      questionId: history._id.toString(),
    }
  });
  return result;
}

export async function OnFinishQuestion(questionHistory: IQuestionPhotoHistory, leftVote: number, rightVote: number) {
  const leftPhotoId = questionHistory.left_photo_id;
  const rightPhotoId = questionHistory.right_photo_id;

  let leftWin = leftVote > rightVote ? true : false;
  if(leftVote == rightVote) {
    leftWin = questionHistory.match_result_before == "win" ? true : false;
  }

  const resultRating = await updateRating(leftPhotoId, rightPhotoId, leftWin);
  questionHistory.left_vote = leftVote;
  questionHistory.left_score_after = resultRating.leftRating;
  questionHistory.right_vote = rightVote;
  questionHistory.right_score_after = resultRating.rightRating;
  questionHistory.match_result_after = leftWin ? "win" : "lose";
  questionHistory.changed_at = new Date();
  await questionHistory.save();

  return resultRating;
}