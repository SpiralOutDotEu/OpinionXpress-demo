// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Survey {
    event SurveyCreated(string ipfsLink, uint256 questionsCount, uint256 optionsPerQuestion);
    event SurveyResponseSubmitted(uint256 surveyID, uint256 encodedResponses);

    struct SurveyDetails {
        string ipfsLink; // IPFS link to the JSON of the survey
        uint256 questionsCount; // Number of questions in the survey
        uint256 optionsPerQuestion; // Number of options per question
        // Nested mapping to store response counts for each question and option
        mapping(uint256 => bool) groupsAllowed;
        mapping(uint256 => bool) nullifierHashes;
        mapping(uint256 => mapping(uint256 => uint256)) responseCounts;
    }

    mapping(uint256 => SurveyDetails) public surveys; // Mapping from survey ID to its details
    uint256 public nextSurveyId; // Counter for the next survey ID

    // Function to create a new survey
    function _createSurvey(
        string memory ipfsLink,
        uint256 questionsCount,
        uint256 optionsPerQuestion,
        uint256[] calldata groupIds
    ) internal {
        surveys[nextSurveyId].ipfsLink = ipfsLink;
        surveys[nextSurveyId].questionsCount = questionsCount;
        surveys[nextSurveyId].optionsPerQuestion = optionsPerQuestion;
        nextSurveyId++;
        for (uint256 i = 0; i < groupIds.length; i++) {
            surveys[nextSurveyId].groupsAllowed[groupIds[i]] = true;
        }
        emit SurveyCreated(ipfsLink, questionsCount, optionsPerQuestion);
    }

    // Function to submit survey responses
    function _submitResponse(uint256 surveyId, uint256 encodedResponses, uint256 nullifierHash) internal {
        require(surveyId < nextSurveyId, "Invalid survey ID");
        require(surveys[surveyId].nullifierHashes[nullifierHash] != true, "Already Submitted");
        SurveyDetails storage survey = surveys[surveyId];
        for (uint256 i = 0; i < survey.questionsCount; i++) {
            uint256 response = (encodedResponses >> (2 * i)) & 0x03;
            require(response < survey.optionsPerQuestion, "Invalid response");
            survey.responseCounts[i][response]++;
        }
        surveys[surveyId].nullifierHashes[nullifierHash] = true;
        emit SurveyResponseSubmitted(surveyId, encodedResponses);
    }

    function getSurvey(uint256 surveyId)
        public
        view
        returns (string memory ipfsLink, uint256 questionsCount, uint256 optionsPerQuestion, uint256[][] memory results)
    {
        require(surveyId < nextSurveyId, "Invalid survey ID");
        SurveyDetails storage survey = surveys[surveyId];

        ipfsLink = survey.ipfsLink;
        questionsCount = survey.questionsCount;
        optionsPerQuestion = survey.optionsPerQuestion;

        results = new uint256[][](questionsCount);
        for (uint256 i = 0; i < questionsCount; i++) {
            results[i] = new uint256[](optionsPerQuestion);
            for (uint256 j = 0; j < optionsPerQuestion; j++) {
                results[i][j] = survey.responseCounts[i][j];
            }
        }
    }
}
