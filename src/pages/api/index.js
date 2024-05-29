// Outputs: /builtwith.json
export async function GET({ params, request }) {
  return new Response(
    JSON.stringify({
      name: 'Steel Anvil Studios',
      url: 'https://steelanvilstudios.com/'
    })
  )
}