export const Root = ({ files }: { files: string[] }) => {
  return (
    <>
      <section class="px-4 py-8">
        <h1 class="text-2xl font-semibold">File browser</h1>
        <table class="table-auto w-full mt-12">
          <thead>
            <tr>
              <th class="text-left">File</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr>
                <td class="text-gray-500">{file}</td>
                <td>
                  <div class="flex space-x-4">
                    <button
                      class="save-btn text-blue-500 text-sm font-semibold"
                      data-filename={file}
                    >
                      Save
                    </button>
                    <button
                      class="delete-btn text-red-500 text-sm font-semibold"
                      data-filename={file}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
};
