// imports, etc...
function generateImage(...) {
  // code ...
  let response;
  let responseContent = {}
  // Make intermediate request to get a shorter summary prompt
  const summaryResponse = await openai.responses.create({
    model: "gpt-4.1-nano",
    input: prompt
  })
  response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: summaryResponse.output_text,
    n: 1,
    size: '1024x1024',
    quality: 'hd',
    style: 'vivid',
    response_format: 'b64_json'
  })
  const b64Json = response.data?.[0]?.b64_json as string
  if (!b64Json) {
    throw new Error('Failed to generate image data from OpenAI.')
  }
  const buffer = new Uint8Array(
    atob(b64Json)
      .split("")
      .map(char => char.charCodeAt(0))
  )
  // resize the image to 667 x 1000?
  const filePath = `${userId}/photos/${userId}-${Date.now()}.png`
  const { data, error } = await supabase.storage
    .from('user-images')
    .upload(filePath, buffer, {
      contentType: 'image/png'
  })
  if (error) {
    throw new Error(`Supabase upload error: ${error.message}`)
  }
  const { data: publicUrlData } = await supabase.storage.from('user-images').publicUrl(filePath)
  responseContent = publicUrlData?.publicUrl || `user-images/${filePath}`

  return new Response(JSON.stringify({ responseContent }), { headers })
}
