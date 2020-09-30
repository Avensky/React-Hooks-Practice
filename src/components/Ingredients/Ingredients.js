import React, { useState, useEffect } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';

const Ingredients = () => {
  const [ ingredients, setIngredients ] = useState([]);

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
      setIngredients(loadedIngredients);
    }));
  }, []);

  useEffect(()=> {
    console.log('Rendering Ingredients', ingredients);
  })

  const addIngredientHandler = ingredient => {
    fetch('https://react-hooks-96261.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type': 'application/json' }
    }).then( response => {
      return response.json();
    }).then(responseData => {
      setIngredients(prevIngredients => [
        ...prevIngredients, 
        {id: responseData.name, ...ingredient}
      ]);
    });
  }

  const removeIngredientHandler = ingredientId => {
    setIngredients(prevIngredients => 
      prevIngredients.filter((ingredient)=> ingredient.id  !== ingredientId)
    );
  }
  return (
    <div className="App">
      <IngredientForm onAddIngredient={addIngredientHandler}/>

      <section>
        <Search />
        <IngredientList ingredients={ingredients} onRemoveItem={removeIngredientHandler}/>
        {/* Need to add list here! */}
      </section>
    </div>
  );
}

export default Ingredients;
