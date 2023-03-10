import { TypedData } from 'ydb-sdk';
import { Driver } from 'ydb-sdk';

interface Icategory {
  categories_name: string;
  categories_id: number;
  subcategories_name: string;
  subcategories_sort_code: number;
  subcategories_id: number;
}

export async function queryRun(driver: Driver) {
  const res = await driver.tableClient.withSession(async (session) => {
    const query = `
        SELECT
            categories_name,
            categories_id,
            subcategories_name,
            subcategories_id,
            subcategories_sort_code
        FROM
            subcategories AS sub
        INNER JOIN
            categories AS cat
        ON sub.category= cat.categories_id
        ORDER BY
            subcategories_sort_code
        limit 3
        ;
    `;
    const data = await session.executeQuery(query);

    const typedData: Icategory[] = TypedData.createNativeObjects(
      data.resultSets[0]
    ) as unknown as Icategory[];

    return typedData;
  });
  return res;
}
