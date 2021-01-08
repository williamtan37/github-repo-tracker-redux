import { SEARCH } from '../constants/actionTypes';

const defaultState = {
    searchValue: "None",
}

export default (state = defaultState, action) => {
    switch (action.type) {
      case SEARCH:
        return {
          ...state,
          searchValue: action.payload.searchValue
        };
      default:
        return state;
    }
  };
  