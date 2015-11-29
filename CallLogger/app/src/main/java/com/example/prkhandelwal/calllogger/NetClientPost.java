package com.example.prkhandelwal.calllogger;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import android.os.AsyncTask;

/**
 * Created by prkhandelwal on 11/29/15.
 */
public class NetClientPost extends AsyncTask<String, Void, String>{
    @Override
    protected String doInBackground(String[] params) {
        try {

            URL url = new URL("http://54.213.224.119:8080/calllog");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setDoOutput(true);
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            String number = params[0].substring(3);
            String input = "{\"number\":\"" + number + "\",\"response\":\"1\", \"bucket\":\"100 \"}";

            OutputStream os = conn.getOutputStream();
            os.write(input.getBytes());
            os.flush();

            if (conn.getResponseCode() != HttpURLConnection.HTTP_CREATED) {
                throw new RuntimeException("Failed : HTTP error code : "
                        + conn.getResponseCode());
            }

            BufferedReader br = new BufferedReader(new InputStreamReader(
                    (conn.getInputStream())));

            String output;
            System.out.println("Output from Server .... \n");
            while ((output = br.readLine()) != null) {
                System.out.println(output);
            }

            conn.disconnect();

        } catch (MalformedURLException e) {

            e.printStackTrace();

        } catch (IOException e) {

            e.printStackTrace();

        }
        // do above Server call here
        return "some message";
    }

    @Override
    protected void onPostExecute(String message) {
        //process message
    }
}
