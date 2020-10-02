import React, { useReducer, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';
import ErrorModal from '../UI/ErrorModal';
import useHttp from '../../hooks/http';

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
  const [ ingredients, dispatch ]        = useReducer(ingredientReducer, []);
  const {isLoading, error, data, sendRequest, reqExtra, reqIdentifier, clear } = useHttp();

  // const [ ingredients,  setIngredients ] = useState([]);
  // const [ isLoading,    setIsLoading   ] = useState(false);
  // const [ error,        setError       ] = useState();

  //useEffect(()=> {
  //  fetch('https://react-hooks-96261.firebaseio.com/ingredients.json')
  //  .then(response => response.json()
  //  .then(responseData => {
  //    const loadedIngredients = [];
  //    for ( const key in responseData) {
  //      loadedIngredients.push({
  //        id: key,
  //        title: responseData[key].title,
  //        amount: responseData[key].amount
  //      })
  //    }
  //    // setIngredients(loadedIngredients);
  //    dispatch({type:'SET', ingredients: loadedIngredients});
  //  }))
  //}, []);

  useEffect(()=> {
    // console.log('Rendering Ingredients', ingredients);
    if (!isLoading && !error && reqIdentifier === 'REMOVE_INGREDIENT') {
      dispatch({type: 'DELETE', id: reqExtra})
    } else if ( !isLoading && !error && reqIdentifier === 'ADD_INGREDIENT') {
      dispatch({
        type: 'ADD',
        ingredient: { id: data.name, ...reqExtra}
      });
    }
  },[data, reqExtra, reqIdentifier, isLoading, error])


  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    //setIngredients(filteredIngredients);
    dispatch({type:'SET', ingredients: filteredIngredients});
  }, [])


  const addIngredientHandler = useCallback(ingredient => {
    sendRequest(
      'https://react-hooks-96261.firebaseio.com/ingredients.json',
      'POST',
      JSON.stringify(ingredient),
      ingredient,
      'ADD_INGREDIENT'
    );
    // dispatchHttp({type: 'SEND'});
    // // setIsLoading(true);
    // fetch('https://react-hooks-96261.firebaseio.com/ingredients.json', {
    //   method: 'POST',
    //   body: JSON.stringify(ingredient),
    //   headers: { 'Content-Type': 'application/json' }
    // }).then( response => {
    //   // setIsLoading(false);
    //   dispatchHttp({type: 'RESPONSE'});
    //   return response.json();
    // }).then(responseData => {
    //   // setIngredients(prevIngredients => [
    //   //   ...prevIngredients, 
    //   //   {id: responseData.name, ...ingredient}
    //   // ]);
    //   dispatch({
    //     type:'ADD', 
    //     ingredient: { id: responseData.name, ...ingredient }
    //   });
    // })
  }, [sendRequest]);

  const removeIngredientHandler = useCallback(ingredientId => {
    sendRequest(
      `https://react-hooks-96261.firebaseio.com/ingredients/${ingredientId}.json`,
      'DELETE',
      null,
      ingredientId,
      'REMOVE_INGREDIENT'
    )
    // dispatchHttp({type: 'SEND'});
    // //setIsLoading(true);
    // fetch(`https://react-hooks-96261.firebaseio.com/ingredients/${ingredientId}.json`, {
    //   method: 'DELETE',
    // }).then( response => {
    //   dispatchHttp({type: 'RESPONSE'});
    //   // setIsLoading(false);
    //   // setIngredients(prevIngredients =>
    //   //   prevIngredients.filter(ingredient=> ingredient.id  !== ingredientId)
    //   // );
    //   dispatch({ type:'DELETE', id: ingredientId });
    // })
    // .catch( error => {
    //   dispatchHttp({type: 'ERROR', errorMessage : error.messsage});
    // })
  }, [sendRequest]
  )

  //const clearError = useCallback(() => {
    // setError(null);
    // dispatchHttp({type: 'CLEAR'});
  //}, [])

  const ingredientList = useMemo(() => {
    return (
      <IngredientList 
        ingredients={ingredients} 
        onRemoveItem={removeIngredientHandler}
      />
    )
  }, [ingredients, removeIngredientHandler])

  return (
    <div className="App">
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
      <IngredientForm 
        onAddIngredient={addIngredientHandler} 
        loading={isLoading}/>

      <section>
        <Search onLoadIngredients = {filteredIngredientsHandler}/>
        {ingredientList}
        {/* Need to add list here! */}
      </section>
    </div>
  );
}

export default Ingredients;
