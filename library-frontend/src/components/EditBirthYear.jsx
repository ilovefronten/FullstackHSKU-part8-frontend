import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { EDIT_BIRTH_YEAR, ALL_AUTHORS } from '../queries'
import Select from 'react-select'

const EditBirthYear = ({ nameList }) => {
  const [name, setName] = useState('')
  const [birth, setBirth] = useState('')

  const [editBirthYear] = useMutation(EDIT_BIRTH_YEAR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    /* onError: (error) => {
      const messages = error.graphQLErrors.map(e => e.message).join('\n')
      notify(messages)
    } */
  })

  const updateBirthYear = async (event) => {
    event.preventDefault()

    console.log(`edit birth year of ${name}...`)

    editBirthYear({
      variables: {
        name,
        setBornTo: birth,
      }
    })
    setBirth('')
  }

  return (<>
    <div>
      <h2>Set Birth Year</h2>
      <form onSubmit={updateBirthYear}>
        
        <div>
          <Select
            options={nameList}
            onChange={(selectedOption) => setName(selectedOption.value)}
          />
        </div>
        <div>
          born:
          <input
            onChange={({ target }) => setBirth(Number(target.value))}
            value={birth}
            type="number"
          />
        </div>
        <button type='submit'>update author</button>
      </form>

    </div>

  </>)
}

export default EditBirthYear
