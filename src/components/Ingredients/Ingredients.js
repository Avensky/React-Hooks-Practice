import React, { useState, useReducer, useEffect, useCallback } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';
import ErrorModal from '../UI/ErrorModal';

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter(ing=>ing.id !== action.id);
    default:
      throw new Error('Should not get there!');
  }
}

const httpReducer = (currHttpState, action ) => {
  switch (action.type) {
    case 'SEND':
      return { loading: true, error: null };
    case 'RESPONSE':
      return { ...currHttpState, loading: false };
    case 'ERROR':
      return { loading: false, error: action.errorMessage };
    case 'CLEAR':
      return { ...currHttpState, error: null };
    default:
      throw new Error('Should not be reached!');
  }
};

const Ingredients = () => {
  const [ ingredients, dispatch ]        = useReducer(ingredientReducer, []);
  const [ httpState, dispatchHttp ]      = useReducer(httpReducer, { loading: false, error: null});

  // const [ ingredients,  setIngredients ] = useState([]);
  // const [ isLoading,    setIsLoading   ] = useState(false);
  // const [ error,        setError       ] = useState();

  useEffect(()=> {
    fetch('https://react-hooks-96261.firebaseio.com/ingredients.json')
    .then(response => response.json()
    .then(responseData => {
      const loadedIngredients = [];
      for ( const key in responseData) {
        loadedIngredients.push({
          id: key,
          title: responseData[key].title,
          amount: responseData[key].amount
        })
      }
      // setIngredients(loadedIngredients);
      dispatch({type:'SET', ingredients: loadedIngredients});
    }))
  }, []);

  useEffect(()=> {
    console.log('Rendering Ingredients', ingredients);
  },[ingredients])


  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    //setIngredients(filteredIngredients);
    dispatch({type:'SET', ingredients: filteredIngredients});
  }, [])


  const addIngredientHandler = ingredient => {
    dispatchHttp({type: 'SEND'});
    // setIsLoading(true);
    fetch('https://react-hooks-96261.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type': 'application/json' }
    }).then( response => {
      // setIsLoading(false);
      dispatchHttp({type: 'RESPONSE'});
      return response.json();
    }).then(responseData => {
      // setIngredients(prevIngredients => [
      //   ...prevIngredients, 
      //   {id: responseData.name, ...ingredient}
      // ]);
      dispatch({
        type:'ADD', 
        ingredient: { id: responseData.name, ...ingredient }
      });
    })
  }

  const removeIngredientHandler = ingredientId => {
    dispatchHttp({type: 'SEND'});
    //setIsLoading(true);
    fetch(`https://react-hooks-96261.firebaseio.com/ingredients/${ingredientId}.json`, {
      method: 'DELETE',
    }).then( response => {
      dispatchHttp({type: 'RESPONSE'});
      // setIsLoading(false);
      // setIngredients(prevIngredients =>
      //   prevIngredients.filter(ingredient=> ingredient.id  !== ingredientId)
      // );
      dispatch({ type:'DELETE', id: ingredientId });
    })
    .catch( error => {
      dispatchHttp({type: 'ERROR', errorMessage : error.messsage});
    })
  }

  const clearError = () => {
    // setError(null);
    dispatchHttp({type: 'CLEAR'});
  }
  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}
      <IngredientForm onAddIngredient={addIngredientHandler} loading={httpState.loading}/>

      <section>
        <Search onLoadIngredients = {filteredIngredientsHandler}/>
        <IngredientList ingredients={ingredients} onRemoveItem={removeIngredientHandler}/>
        {/* Need to add list here! */}
      </section>
    </div>
  );
}

export default Ingredients;
