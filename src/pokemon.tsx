import * as React from 'react'
import type {PokemonData, PokemonListItem} from './types'
import type {FallbackProps, ErrorBoundaryProps} from 'react-error-boundary'
import {ErrorBoundary} from 'react-error-boundary'

const formatDate = (date: Date) =>
  `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${String(
    date.getSeconds(),
  ).padStart(2, '0')}.${String(date.getMilliseconds()).padStart(3, '0')}`

/**
 * Fetch data for a pokemon by its name
 *
 * @param name the name of the pokemon
 * @param options.delay an arbitrary delay (to test loading states). This is optional and defaults to 1500
 * @param options.signal The signal to cancel the request. This is optional and defaults to undefined
 */
async function fetchPokemon(
  name: string,
  {signal, delay = 1500}: {signal?: AbortSignal; delay?: number} = {},
): Promise<PokemonData> {
  const pokemonQuery = `
    query PokemonInfo($name: String) {
      pokemon(name: $name) {
        id
        number
        name
        image
        attacks {
          special {
            name
            type
            damage
          }
        }
      }
    }
  `

  const response = await window.fetch('https://graphql-pokemon2.vercel.app/', {
    // learn more about this API here: https://graphql-pokemon2.vercel.app/
    method: 'POST',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      delay: String(delay),
    },
    signal,
    body: JSON.stringify({
      query: pokemonQuery,
      variables: {name: name.toLowerCase()},
    }),
  })

  type JSONResponse = {
    data?: {
      pokemon: Omit<PokemonData, 'fetchedAt'>
    }
    errors?: Array<{message: string}>
  }
  const {data, errors}: JSONResponse = await response.json()
  if (response.ok) {
    const pokemon = data?.pokemon
    if (pokemon) {
      // add fetchedAt helper
      return Object.assign(pokemon, {fetchedAt: formatDate(new Date())})
    } else {
      return Promise.reject(new Error(`No pokemon with the name "${name}"`))
    }
  } else {
    // handle the graphql errors
    const error = new Error(errors?.map(e => e.message).join('\n') ?? 'unknown')
    return Promise.reject(error)
  }
}

/**
 * Fetch a list of the first pokemon
 * @param first the number of pokemon to fetch. Defaults to 6
 * @param options.delay an arbitrary delay (to test loading states). This is optional and defaults to 1500
 * @param options.signal The signal to cancel the request. This is optional and defaults to undefined
 */
async function fetchPokemonList(
  first: number = 6,
  {signal, delay = 1500}: {signal?: AbortSignal; delay?: number} = {},
): Promise<Array<PokemonListItem>> {
  const pokemonQuery = `
    query PokemonList($first: Int) {
      pokemons(first: $first) {
        id
        name
        image
        number
      }
    }
  `

  const response = await window.fetch('https://graphql-pokemon2.vercel.app/', {
    // learn more about this API here: https://graphql-pokemon2.vercel.app/
    method: 'POST',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      delay: String(delay),
    },
    signal,
    body: JSON.stringify({
      query: pokemonQuery,
      variables: {first},
    }),
  })

  type JSONResponse = {
    data?: {
      pokemons: Array<PokemonListItem>
    }
    errors?: Array<{message: string}>
  }
  const {data, errors}: JSONResponse = await response.json()
  if (response.ok) {
    const pokemons = data?.pokemons
    if (pokemons) {
      return pokemons
    } else {
      return Promise.reject(new Error(`No pokemons found`))
    }
  } else {
    // handle the graphql errors
    const error = new Error(errors?.map(e => e.message).join('\n') ?? 'unknown')
    return Promise.reject(error)
  }
}

function PokemonInfoFallback({name}: {name: string}) {
  const initialName = React.useRef(name).current
  const fallbackPokemonData: PokemonData = {
    id: 'loading-pokemon',
    name: initialName,
    number: 'XXX',
    image: '/img/pokemon/fallback-pokemon.jpg',
    attacks: {
      special: [
        {name: 'Loading Attack 1', type: 'Type', damage: -1},
        {name: 'Loading Attack 2', type: 'Type', damage: -1},
      ],
    },
    fetchedAt: 'loading...',
  }
  return <PokemonDataView pokemon={fallbackPokemonData} />
}

function PokemonDataView({pokemon}: {pokemon: PokemonData}) {
  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <section>
        <h2>
          {pokemon.name}
          <sup>{pokemon.number}</sup>
        </h2>
      </section>
      <section>
        <ul>
          {pokemon.attacks.special.map(attack => (
            <li key={attack.name}>
              <label>{attack.name}</label>:{' '}
              <span>
                {attack.damage < 0 ? 'XX' : attack.damage}{' '}
                <small>({attack.type})</small>
              </span>
            </li>
          ))}
        </ul>
      </section>
      <small className="pokemon-info__fetch-time">{pokemon.fetchedAt}</small>
    </div>
  )
}

function PokemonForm({
  pokemonName: externalPokemonName,
  initialPokemonName = externalPokemonName ?? '',
  onSubmit,
}: {
  pokemonName: string
  initialPokemonName?: string
  onSubmit: (newPokemonName: string) => void
}) {
  const [pokemonName, setPokemonName] = React.useState(initialPokemonName)

  // this is generally not a great idea. We're synchronizing state when it is
  // normally better to derive it https://kentcdodds.com/blog/dont-sync-state-derive-it
  // however, we're doing things this way to make it easier for the exercises
  // to not have to worry about the logic for this PokemonForm component.
  React.useEffect(() => {
    // note that because it's a string value, if the externalPokemonName
    // is the same as the one we're managing, this will not trigger a re-render
    if (typeof externalPokemonName === 'string') {
      setPokemonName(externalPokemonName)
    }
  }, [externalPokemonName])

  function handleChange(e: React.SyntheticEvent<HTMLInputElement>) {
    setPokemonName(e.currentTarget.value)
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    onSubmit(pokemonName)
  }

  function handleSelect(newPokemonName: string) {
    setPokemonName(newPokemonName)
    onSubmit(newPokemonName)
  }

  return (
    <form onSubmit={handleSubmit} className="pokemon-form">
      <label htmlFor="pokemonName-input">Pokemon Name</label>
      <small>
        Try{' '}
        <button
          className="invisible-button"
          type="button"
          onClick={() => handleSelect('pikachu')}
        >
          "pikachu"
        </button>
        {', '}
        <button
          className="invisible-button"
          type="button"
          onClick={() => handleSelect('charizard')}
        >
          "charizard"
        </button>
        {', or '}
        <button
          className="invisible-button"
          type="button"
          onClick={() => handleSelect('mew')}
        >
          "mew"
        </button>
      </small>
      <div>
        <input
          className="pokemonName-input"
          id="pokemonName-input"
          name="pokemonName"
          placeholder="Pokemon Name..."
          value={pokemonName}
          onChange={handleChange}
          onClick={handleChange}
        />
        <button type="submit" disabled={!pokemonName.length}>
          Submit
        </button>
      </div>
    </form>
  )
}

function ErrorFallback({error, resetErrorBoundary}: FallbackProps) {
  return (
    <div role="alert">
      There was an error:{' '}
      <pre style={{whiteSpace: 'normal'}}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

function PokemonErrorBoundary(
  props: Pick<ErrorBoundaryProps, 'onReset' | 'resetKeys'> & {
    children: React.ReactNode
  },
) {
  return <ErrorBoundary FallbackComponent={ErrorFallback} {...props} />
}

const allPokemon: Record<string, Omit<PokemonData, 'fetchedAt'>> = {
  pikachu: {
    id: 'UG9rZW1vbjowMjU=',
    number: '025',
    name: 'Pikachu',
    image: '/img/pokemon/pikachu.jpg',
    color: '#EDD37E',
    attacks: {
      special: [
        {
          name: 'Discharge',
          type: 'Electric',
          damage: 35,
        },
        {
          name: 'Thunder',
          type: 'Electric',
          damage: 100,
        },
        {
          name: 'Thunderbolt',
          type: 'Electric',
          damage: 55,
        },
      ],
    },
  },
  mew: {
    id: 'UG9rZW1vbjoxNTE=',
    number: '151',
    image: '/img/pokemon/mew.jpg',
    name: 'Mew',
    color: '#ECC4D0',
    attacks: {
      special: [
        {
          name: 'Dragon Pulse',
          type: 'Dragon',
          damage: 65,
        },
        {
          name: 'Earthquake',
          type: 'Ground',
          damage: 100,
        },
        {
          name: 'Fire Blast',
          type: 'Fire',
          damage: 100,
        },
        {
          name: 'Hurricane',
          type: 'Flying',
          damage: 80,
        },
        {
          name: 'Hyper Beam',
          type: 'Normal',
          damage: 120,
        },
        {
          name: 'Moonblast',
          type: 'Fairy',
          damage: 85,
        },
        {
          name: 'Psychic',
          type: 'Psychic',
          damage: 55,
        },
        {
          name: 'Solar Beam',
          type: 'Grass',
          damage: 120,
        },
        {
          name: 'Thunder',
          type: 'Electric',
          damage: 100,
        },
      ],
    },
  },
  mewtwo: {
    id: 'UG9rZW1vbjoxNTA=',
    number: '150',
    image: '/img/pokemon/mewtwo.jpg',
    name: 'Mewtwo',
    color: '#BAABBA',
    attacks: {
      special: [
        {
          name: 'Hyper Beam',
          type: 'Normal',
          damage: 120,
        },
        {
          name: 'Psychic',
          type: 'Psychic',
          damage: 55,
        },
        {
          name: 'Shadow Ball',
          type: 'Ghost',
          damage: 45,
        },
      ],
    },
  },
  ditto: {
    id: 'UG9rZW1vbjoxMzI=',
    number: '132',
    image: '/img/pokemon/ditto.jpg',
    name: 'Ditto',
    color: '#BDAED1',
    attacks: {
      special: [
        {
          name: 'Struggle',
          type: 'Normal',
          damage: 15,
        },
      ],
    },
  },
  charizard: {
    id: 'UG9rZW1vbjowMDY=',
    number: '006',
    image: '/img/pokemon/charizard.jpg',
    name: 'Charizard',
    color: '#EAC492',
    attacks: {
      special: [
        {
          name: 'Dragon Claw',
          type: 'Dragon',
          damage: 35,
        },
        {
          name: 'Fire Blast',
          type: 'Fire',
          damage: 100,
        },
        {
          name: 'Flamethrower',
          type: 'Fire',
          damage: 55,
        },
      ],
    },
  },
  bulbasaur: {
    id: 'UG9rZW1vbjowMDE=',
    number: '001',
    image: '/img/pokemon/bulbasaur.jpg',
    name: 'Bulbasaur',
    color: '#7DAD96',
    attacks: {
      special: [
        {
          name: 'Power Whip',
          type: 'Grass',
          damage: 70,
        },
        {
          name: 'Seed Bomb',
          type: 'Grass',
          damage: 40,
        },
        {
          name: 'Sludge Bomb',
          type: 'Poison',
          damage: 55,
        },
      ],
    },
  },
}

export {
  PokemonInfoFallback,
  PokemonForm,
  PokemonDataView,
  fetchPokemon,
  fetchPokemonList,
  PokemonErrorBoundary,
  allPokemon,
}
