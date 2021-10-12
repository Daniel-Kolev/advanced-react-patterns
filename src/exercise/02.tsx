// Composition and Layout Components
// http://localhost:3000/isolated/exercise/02.tsx

import '../02.styles.css'
import * as React from 'react'
import {allPokemon, PokemonDataView} from '../pokemon'
import type {PokemonData, User} from '../types'

function App() {
  const [user] = React.useState<User>({name: 'Kody', image: '/img/kody.png'})
  const [pokemonList] = React.useState<Array<PokemonData>>(() =>
    Object.values(allPokemon),
  )
  const [selectedPokemon, setSelectedPokemon] =
    React.useState<PokemonData | null>(null)

  return (
    <div
      id="app-root"
      style={{['--accent-color' as any]: selectedPokemon?.color ?? 'black'}}
    >
      <Nav user={user} />
      <div className="spacer" data-size="lg" />
      <Main
        pokemonList={pokemonList}
        selectedPokemon={selectedPokemon}
        setSelectedPokemon={setSelectedPokemon}
      />
      <div className="spacer" data-size="lg" />
      <Footer user={user} />
    </div>
  )
}

function Nav({user}: {user: User}) {
  return (
    <nav>
      <ul>
        <li>
          <a href="/home">Home</a>
        </li>
        <li>
          <a href="/about">About</a>
        </li>
        <li>
          <a href="/contact">Contact</a>
        </li>
      </ul>
      <a href="/me" title="User Settings">
        <img src={user.image} alt={`${user.name} profile`} />
      </a>
    </nav>
  )
}

function Main({
  pokemonList,
  selectedPokemon,
  setSelectedPokemon,
}: {
  pokemonList: Array<PokemonData>
  selectedPokemon: PokemonData | null
  setSelectedPokemon: (pokemon: PokemonData) => void
}) {
  return (
    <main>
      <List pokemonList={pokemonList} setSelectedPokemon={setSelectedPokemon} />
      <Details selectedPokemon={selectedPokemon} />
    </main>
  )
}

function List({
  pokemonList,
  setSelectedPokemon,
}: {
  pokemonList: Array<PokemonData>
  setSelectedPokemon: (pokemon: PokemonData) => void
}) {
  return (
    <div className="pokemon-list">
      <ul>
        {pokemonList.map(p => (
          <li key={p.id}>
            <PokemonListItemButton
              pokemon={p}
              onClick={() => setSelectedPokemon(p)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

function PokemonListItemButton({
  pokemon,
  onClick,
}: {
  pokemon: PokemonData
  onClick: () => void
}) {
  return (
    <button
      className="pokemon-item"
      onClick={onClick}
      style={{['--accent-color' as any]: pokemon.color}}
    >
      <img src={pokemon.image} alt={pokemon.name} />
      <div className="pokemon-list-info">
        <strong>{pokemon.name}</strong>
        <small>{`(${pokemon.number})`}</small>
      </div>
    </button>
  )
}

function Details({selectedPokemon}: {selectedPokemon: PokemonData | null}) {
  return selectedPokemon ? (
    <div>
      <PokemonDataView pokemon={selectedPokemon} />
    </div>
  ) : (
    <div>Select a Pokemon</div>
  )
}

function Footer({user}: {user: User}) {
  return (
    <footer>
      <p>{`Don't have a good day–have a great day, ${user.name}`}</p>
    </footer>
  )
}

export default App
