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

const Ingredients = () => {
  const [ ingredients, dispatch ]         = useReducer(ingredientReducer, []);

  // const [ ingredients,  setIngredients ] = useState([]);
  const [ isLoading,    setIsLoading   ] = useState(false);
  const [ error,        setError       ] = useState();

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
    .catch(error => {
      setIsLoading(false);
      setError('Something went wrong!');
    })
  }, []);

  useEffect(()=> {
    console.log('Rendering Ingredients', ingredients);
  },[ingredients])


  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    //setIngredients(filteredIngredients);
    dispatch({type:'SET', ingredients: filteredIngredients});
  }, [])


  const addIngredientHandler = ingredient => {
    setIsLoading(true);
    fetch('https://react-hooks-96261.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type': 'application/json' }
    }).then( response => {
      setIsLoading(false);
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
    setIsLoading(true);
    fetch(`https://react-hooks-96261.firebaseio.com/ingredients/${ingredientId}.json`, {
      method: 'DELETE',
    }).then( response => {
      setIsLoading(false);
      // setIngredients(prevIngredients =>
      //   prevIngredients.filter(ingredient=> ingredient.id  !== ingredientId)
      // );
      dispatch({ type:'DELETE', id: ingredientId });
    });
  }

  const clearError = () => {
    setError(null);
  }
  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}
      <IngredientForm onAddIngredient={addIngredientHandler} loading={isLoading}/>

      <section>
        <Search onLoadIngredients = {filteredIngredientsHandler}/>
        <IngredientList ingredients={ingredients} onRemoveItem={removeIngredientHandler}/>
        {/* Need to add list here! */}
      </section>
    </div>
  );
}

export default Ingredients;
